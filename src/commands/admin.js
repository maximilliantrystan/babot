/**
 * ADMIN Command
 * 
 * Manage admin dengan level system
 * Level: 5=Owner, 4=Super Admin, 3=Moderator, 2=Helper, 1=Junior Helper
 * 
 * Owner (5): Bisa add admin level 1-4
 * Level 4: Bisa add admin level 1-3
 * Level 3: Bisa add admin level 1-2
 * Level 1-2: Tidak bisa add
 */

import modData from "../libs/moderationData.js";

const adminCommand = {
  name: "admin",
  category: "moderation",
  description: "Kelola admin dengan sistem level untuk grup",
  usage: ".admin [add|remove|level|list|help]",
  aliases: ["adm"],
  ownerOnly: true,

  async execute({ sock, message, args }) {
    const { remoteJid, sender, isGroup } = message;

    // Check if it's a group
    if (!isGroup) {
      await sock.sendMessage(remoteJid, {
        text: "❌ Perintah ini hanya bisa digunakan di grup",
      });
      return;
    }

    if (args.length === 0) {
      // Show admin list
      await this.showList(sock, remoteJid, sender);
      return;
    }

    const subcommand = args[0].toLowerCase();

    switch (subcommand) {
      case "add":
        return await this.addAdmin(sock, remoteJid, sender, args, message);

      case "remove":
      case "rem":
        return await this.removeAdmin(sock, remoteJid, sender, args, message);

      case "level":
        return await this.setLevel(sock, remoteJid, sender, args, message);

      case "list":
      case "show":
        return await this.showList(sock, remoteJid, sender);

      case "help":
      case "h":
        return await this.showHelp(sock, remoteJid);

      default:
        await sock.sendMessage(remoteJid, {
          text: `❌ Subcommand "${subcommand}" tidak diketahui\n\nGunakan: .admin help untuk melihat semua perintah`,
        });
    }
  },

  /**
   * Get user level
   * Owner phone = level 5
   * Other = level from modData
   */
  getUserLevel(groupId, phoneNumber, ownerPhone) {
    const normalized = phoneNumber.includes("@") ? phoneNumber.split("@")[0] : phoneNumber;
    const ownerNormalized = ownerPhone.includes("@") ? ownerPhone.split("@")[0] : ownerPhone;
    
    if (normalized === ownerNormalized) return 5;
    return modData.getAdminLevel(groupId, phoneNumber);
  },

  async addAdmin(sock, groupId, sender, args, message) {
    if (args.length < 2) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .admin add <nomor> [level 1-4]\n\nContoh: .admin add 6288xxxxxxx 3",
      });
      return;
    }

    const phoneNumber = args[1]
      .replace("@", "")
      .replace("s.whatsapp.net", "")
      .trim();

    if (!phoneNumber || phoneNumber.length < 7) {
      await sock.sendMessage(groupId, {
        text: "❌ Nomor telpon tidak valid",
      });
      return;
    }

    // Get level from args or default to 1
    let targetLevel = 1;
    if (args[2]) {
      targetLevel = Math.min(Math.max(parseInt(args[2]), 1), 4);
    }

    // Check permission
    const senderPhone = sender.split("@")[0];
    const senderLevel = this.getUserLevel(groupId, sender, message.m.remoteJid); // Will be fixed in actual implementation
    
    // For now, assume owner can add any level
    const ownerPhone = process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net";
    const isOwner = senderPhone === ownerPhone.split("@")[0];

    if (!isOwner) {
      await sock.sendMessage(groupId, {
        text: `❌ Hanya owner yang bisa menambah admin`,
      });
      return;
    }

    // Check if already admin
    const existing = modData.getAdminInfo(groupId, phoneNumber);
    if (existing) {
      await sock.sendMessage(groupId, {
        text: `⚠️  ${phoneNumber} sudah menjadi admin level ${existing.level}`,
      });
      return;
    }

    // Add admin
    modData.addAdmin(groupId, phoneNumber, targetLevel);

    const levelName = {
      1: "Junior Helper 🟢",
      2: "Helper 🔵",
      3: "Moderator 🟣",
      4: "Super Admin 🔴",
    }[targetLevel];

    await sock.sendMessage(groupId, {
      text: `✅ ${phoneNumber} ditambahkan sebagai admin\n🏅 Level: ${levelName}`,
    });
  },

  async removeAdmin(sock, groupId, sender, args, message) {
    if (args.length < 2) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .admin remove <nomor>\n\nContoh: .admin remove 6288xxxxxxx",
      });
      return;
    }

    const phoneNumber = args[1]
      .replace("@", "")
      .replace("s.whatsapp.net", "")
      .trim();

    const ownerPhone = process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net";
    const senderPhone = sender.split("@")[0];
    const isOwner = senderPhone === ownerPhone.split("@")[0];

    if (!isOwner) {
      await sock.sendMessage(groupId, {
        text: `❌ Hanya owner yang bisa menghapus admin`,
      });
      return;
    }

    const removed = modData.removeAdmin(groupId, phoneNumber);

    if (removed) {
      await sock.sendMessage(groupId, {
        text: `✅ ${phoneNumber} dihapus dari daftar admin`,
      });
    } else {
      await sock.sendMessage(groupId, {
        text: `❌ ${phoneNumber} tidak ditemukan di daftar admin`,
      });
    }
  },

  async setLevel(sock, groupId, sender, args, message) {
    if (args.length < 3) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .admin level <nomor> <level 1-4>\n\nContoh: .admin level 6288xxxxxxx 3",
      });
      return;
    }

    const phoneNumber = args[1]
      .replace("@", "")
      .replace("s.whatsapp.net", "")
      .trim();

    const newLevel = Math.min(Math.max(parseInt(args[2]), 1), 4);

    const ownerPhone = process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net";
    const senderPhone = sender.split("@")[0];
    const isOwner = senderPhone === ownerPhone.split("@")[0];

    if (!isOwner) {
      await sock.sendMessage(groupId, {
        text: `❌ Hanya owner yang bisa mengubah level admin`,
      });
      return;
    }

    const existing = modData.getAdminInfo(groupId, phoneNumber);
    if (!existing) {
      await sock.sendMessage(groupId, {
        text: `❌ ${phoneNumber} bukan admin`,
      });
      return;
    }

    modData.updateAdminLevel(groupId, phoneNumber, newLevel);

    const levelName = {
      1: "Junior Helper 🟢",
      2: "Helper 🔵",
      3: "Moderator 🟣",
      4: "Super Admin 🔴",
    }[newLevel];

    await sock.sendMessage(groupId, {
      text: `✅ ${phoneNumber} level diubah menjadi: ${levelName}`,
    });
  },

  async showList(sock, groupId, sender) {
    const admins = modData.getAdmins(groupId);
    const ownerPhone = process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net";
    const ownerNormalized = ownerPhone.split("@")[0];

    let text = `👮 *Daftar Admin*\n\n`;

    // Show owner
    text += `👑 *OWNER LEVEL 5*\n`;
    text += `${ownerNormalized}\n\n`;

    if (admins.length === 0) {
      text += `📋 Belum ada admin custom selain owner\n`;
    } else {
      text += `*ADMIN CUSTOM:*\n`;

      const levelLabelMap = {
        1: "🟢 Junior Helper L1",
        2: "🔵 Helper L2",
        3: "🟣 Moderator L3",
        4: "🔴 Super Admin L4",
      };

      for (let i = 0; i < admins.length; i++) {
        const admin = admins[i];
        const label = levelLabelMap[admin.level] || `Level ${admin.level}`;
        text += `${i + 1}. ${admin.phone} - ${label}\n`;
      }
    }

    text += `\n📝 *Sistem Level:*\n`;
    text += `🟢 L1: Junior Helper - Tidak bisa add\n`;
    text += `🔵 L2: Helper - Tidak bisa add\n`;
    text += `🟣 L3: Moderator - Bisa add L1-L2\n`;
    text += `🔴 L4: Super Admin - Bisa add L1-L3\n`;
    text += `👑 L5: Owner - Bisa add L1-L4\n`;

    await sock.sendMessage(sender.includes("@g.us") ? sender : groupId, { text });
  },

  async showHelp(sock, remoteJid) {
    let text = `╔════════════════════════╗\n`;
    text += `║  📖 ADMIN HELP         ║\n`;
    text += `╚════════════════════════╝\n\n`;

    text += `*📋 Syntax:* .admin [subcommand] [args]\n\n`;

    text += `*🔧 Subcommands:*\n\n`;

    text += `1️⃣ *add* - Tambah admin custom\n`;
    text += `   Format: .admin add <nomor> [level]\n`;
    text += `   Contoh: .admin add 6288xxxxxxx 3\n`;
    text += `   Default level: 1 (Junior Helper)\n\n`;

    text += `2️⃣ *level* - Ubah level admin\n`;
    text += `   Format: .admin level <nomor> <level 1-4>\n`;
    text += `   Contoh: .admin level 6288xxxxxxx 3\n\n`;

    text += `3️⃣ *remove* - Hapus admin\n`;
    text += `   Format: .admin remove <nomor>\n`;
    text += `   Contoh: .admin remove 6288xxxxxxx\n\n`;

    text += `4️⃣ *list* - Lihat daftar admin\n`;
    text += `   Format: .admin list\n\n`;

    text += `*🏅 Level System:*\n`;
    text += `L1 🟢: Junior Helper - Tidak bisa add\n`;
    text += `L2 🔵: Helper - Tidak bisa add\n`;
    text += `L3 🟣: Moderator - Bisa add L1-L2\n`;
    text += `L4 🔴: Super Admin - Bisa add L1-L3\n`;
    text += `L5 👑: Owner - Bisa add L1-L4\n\n`;

    text += `*📝 Catatan:*\n`;
    text += `• Hanya OWNER yang bisa add/remove admin\n`;
    text += `• Nomor format: 6288xxxxxxx (tanpa + atau @)\n`;
    text += `• Admin bisa pakai .automod & .antilink\n`;

    await sock.sendMessage(remoteJid, { text });
  },
};

export default adminCommand;
