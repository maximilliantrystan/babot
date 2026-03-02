/**
 * ANTILINK Command
 * 
 * Manage antilink untuk grup
 * - antilink on/off
 * - antilink limit <max_links>
 * - antilink status
 */

import modData from "../libs/moderationData.js";

const antilinkCommand = {
  name: "antilink",
  category: "moderation",
  description: "Kelola antilink untuk mencegah spam link",
  usage: ".antilink [on|off|limit|status] <args>",
  aliases: ["alink"],
  adminOnly: true,

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
      // Show status
      await this.showStatus(sock, remoteJid, remoteJid);
      return;
    }

    const subcommand = args[0].toLowerCase();

    switch (subcommand) {
      case "on":
      case "enable":
        return await this.toggleStatus(sock, remoteJid, true, message);

      case "off":
      case "disable":
        return await this.toggleStatus(sock, remoteJid, false, message);

      case "limit":
      case "maxlimit":
      case "max":
        return await this.setLimit(sock, remoteJid, args, message);

      case "status":
      case "info":
        return await this.showStatus(sock, remoteJid, remoteJid);

      case "help":
      case "h":
        return await this.showHelp(sock, remoteJid);

      default:
        await sock.sendMessage(remoteJid, {
          text: `❌ Subcommand "${subcommand}" tidak diketahui\n\nGunakan: .antilink help untuk melihat semua perintah`,
        });
    }
  },

  async toggleStatus(sock, groupId, enabled, message) {
    modData.setAntilinkStatus(groupId, enabled);
    const status = enabled ? "✅ ON" : "❌ OFF";
    const desc = enabled ? "diaktifkan" : "dinonaktifkan";

    await sock.sendMessage(groupId, {
      text: `${status} Antilink telah ${desc}\n\n_Link yang dikirim akan dihapus_`,
    });
  },

  async setLimit(sock, groupId, args, message) {
    if (args.length < 2 || isNaN(args[1])) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .antilink limit <angka>\n\nContoh: .antilink limit 2",
      });
      return;
    }

    const limit = Math.max(1, parseInt(args[1]));
    modData.setAntilinkLimit(groupId, limit);

    await sock.sendMessage(groupId, {
      text: `✅ Limit link per hari diatur ke ${limit}\n\nSetiap pengguna bisa mengirim maksimal ${limit} link per hari`,
    });
  },

  async showStatus(sock, groupId, remoteJid) {
    const settings = modData.getGroupSettings(groupId);
    const { antilink } = settings;

    let text = `╔════════════════════════╗\n`;
    text += `║  🔗 ANTILINK STATUS    ║\n`;
    text += `╚════════════════════════╝\n\n`;

    text += `${antilink.enabled ? "✅" : "❌"} *Status:* ${antilink.enabled ? "AKTIF" : "NONAKTIF"}\n`;
    text += `📊 *Limit per hari:* ${antilink.maxPerDay} link\n\n`;

    text += `_Deteksi link: chat.whatsapp.com_\n`;
    text += `_Counter reset setiap hari_`;

    await sock.sendMessage(remoteJid, { text });
  },

  async showHelp(sock, remoteJid) {
    let text = `╔════════════════════════╗\n`;
    text += `║  📖 ANTILINK HELP      ║\n`;
    text += `╚════════════════════════╝\n\n`;

    text += `*📋 Syntax:* .antilink [subcommand] [args]\n\n`;

    text += `*🔧 Subcommands:*\n\n`;

    text += `1️⃣ *on* - Aktifkan antilink\n`;
    text += `   Format: .antilink on\n\n`;

    text += `2️⃣ *off* - Nonaktifkan antilink\n`;
    text += `   Format: .antilink off\n\n`;

    text += `3️⃣ *limit* - Set limit link per hari\n`;
    text += `   Format: .antilink limit <angka>\n`;
    text += `   Contoh: .antilink limit 2\n\n`;

    text += `4️⃣ *status* - Lihat status antilink\n`;
    text += `   Format: .antilink status\n\n`;

    text += `*⚙️ Fitur:*\n`;
    text += `• Deteksi link: chat.whatsapp.com, wa.me, whatsapp.com\n`;
    text += `• Auto delete link yang dikirim\n`;
    text += `• Limit per user per hari\n`;
    text += `• Counter reset setiap ganti hari\n`;
    text += `• Per grup setting\n`;

    await sock.sendMessage(remoteJid, { text });
  },
};

export default antilinkCommand;
