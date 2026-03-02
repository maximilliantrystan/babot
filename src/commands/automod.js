/**
 * AUTOMOD Command
 * 
 * Manage automod untuk grup
 * - automod add word <word>
 * - automod remove word <word>
 * - automod on/off
 * - automod warn <max_warn>
 * - automod list
 * - automod status
 */

import modData from "../libs/moderationData.js";

const automodCommand = {
  name: "automod",
  category: "moderation",
  description: "Kelola automod filter untuk grup",
  usage: ".automod [add|remove|on|off|warn|list|status] <args>",
  aliases: ["amod"],
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
      // Show automod status
      await this.showStatus(sock, remoteJid, remoteJid);
      return;
    }

    const subcommand = args[0].toLowerCase();

    switch (subcommand) {
      case "add":
      case "addword":
        return await this.addWord(sock, remoteJid, args, message);

      case "remove":
      case "removeword":
      case "rem":
        return await this.removeWord(sock, remoteJid, args, message);

      case "on":
      case "enable":
        return await this.toggleStatus(sock, remoteJid, true, message);

      case "off":
      case "disable":
        return await this.toggleStatus(sock, remoteJid, false, message);

      case "warn":
      case "maxwarn":
        return await this.setMaxWarn(sock, remoteJid, args, message);

      case "list":
      case "words":
        return await this.listWords(sock, remoteJid, remoteJid);

      case "status":
      case "info":
        return await this.showStatus(sock, remoteJid, remoteJid);

      default:
        await sock.sendMessage(remoteJid, {
          text: `❌ Subcommand "${subcommand}" tidak diketahui\n\nGunakan: .automod [add|remove|on|off|warn|list|status]`,
        });
    }
  },

  async addWord(sock, groupId, args, message) {
    if (args.length < 2) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .automod add word <kata>",
      });
      return;
    }

    const word = args.slice(1).join(" ").toLowerCase();

    if (word.length === 0 || word.length > 50) {
      await sock.sendMessage(groupId, {
        text: "❌ Kata harus antara 1-50 karakter",
      });
      return;
    }

    const added = modData.addBannedWord(groupId, word);

    if (added) {
      await sock.sendMessage(groupId, {
        text: `✅ Kata "${word}" ditambahkan ke filter automod`,
      });
    } else {
      await sock.sendMessage(groupId, {
        text: `⚠️  Kata "${word}" sudah ada di filter`,
      });
    }
  },

  async removeWord(sock, groupId, args, message) {
    if (args.length < 2) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .automod remove word <kata>",
      });
      return;
    }

    const word = args.slice(1).join(" ").toLowerCase();
    const removed = modData.removeBannedWord(groupId, word);

    if (removed) {
      await sock.sendMessage(groupId, {
        text: `✅ Kata "${word}" dihapus dari filter automod`,
      });
    } else {
      await sock.sendMessage(groupId, {
        text: `❌ Kata "${word}" tidak ditemukan di filter`,
      });
    }
  },

  async toggleStatus(sock, groupId, enabled, message) {
    modData.setAutomodStatus(groupId, enabled);
    const status = enabled ? "✅ ON" : "❌ OFF";
    const desc = enabled ? "diaktifkan" : "dinonaktifkan";

    await sock.sendMessage(groupId, {
      text: `${status} Automod telah ${desc}`,
    });
  },

  async setMaxWarn(sock, groupId, args, message) {
    if (args.length < 2 || isNaN(args[1])) {
      await sock.sendMessage(groupId, {
        text: "❌ Format: .automod warn <angka>\n\nContoh: .automod warn 3",
      });
      return;
    }

    const maxWarn = Math.max(1, parseInt(args[1]));
    modData.setMaxWarn(groupId, maxWarn);

    await sock.sendMessage(groupId, {
      text: `✅ Maksimal warn diatur ke ${maxWarn}\n\nJika mencapai ${maxWarn}, pengguna akan di-kick`,
    });
  },

  async listWords(sock, groupId, remoteJid) {
    const words = modData.getBannedWords(groupId);

    if (words.length === 0) {
      await sock.sendMessage(remoteJid, {
        text: "📋 Belum ada kata yang difilter",
      });
      return;
    }

    let text = `📋 *Daftar kata terlarang* (${words.length})\n\n`;

    for (let i = 0; i < words.length; i++) {
      text += `${i + 1}. "${words[i]}"\n`;
    }

    await sock.sendMessage(remoteJid, { text });
  },

  async showStatus(sock, groupId, remoteJid) {
    const settings = modData.getGroupSettings(groupId);
    const { automod } = settings;

    let text = `╔═══════════════════════╗\n`;
    text += `║  🛡️  AUTOMOD STATUS  ║\n`;
    text += `╚═══════════════════════╝\n\n`;

    text += `${automod.enabled ? "✅" : "❌"} *Status:* ${automod.enabled ? "AKTIF" : "NONAKTIF"}\n`;
    text += `⚠️  *Max Warn:* ${automod.maxWarn}\n`;
    text += `📝 *Filter Words:* ${automod.bannedWords.length}\n\n`;

    if (automod.bannedWords.length > 0) {
      text += `Kata-kata:\n`;
      automod.bannedWords.slice(0, 5).forEach((w, i) => {
        text += `${i + 1}. "${w}"\n`;
      });
      if (automod.bannedWords.length > 5) {
        text += `... dan ${automod.bannedWords.length - 5} lagi\n`;
      }
    }

    text += `\n_Gunakan: .automod list untuk melihat semua kata_`;

    await sock.sendMessage(remoteJid, { text });
  },
};

export default automodCommand;
