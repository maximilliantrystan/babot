/**
 * HELP Command
 * 
 * Tampilkan daftar command dengan kategori
 */

const helpCommand = {
  name: "help",
  category: "info",
  description: "Tampilkan daftar command yang tersedia",
  usage: ".help [command|category]",
  aliases: ["h", "?"],

  /**
   * Help command needs commandHandler instance
   * Pass as property: command._handler = commandHandler
   */
  async execute({ sock, message, args, prefix }, _handler) {
    const { remoteJid } = message;
    const handler = this._handler;

    if (!handler) {
      await sock.sendMessage(remoteJid, {
        text: "❌ Command handler tidak tersedia",
      });
      return;
    }

    if (args.length === 0) {
      // Tampilkan kategori
      const commands = handler.getAllCommands();
      const categories = {};

      for (const cmd of commands) {
        const cat = cmd.category || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      }

      let text = `╔════════════════════╗\n`;
      text += `║   🤖 BOT COMMANDS   ║\n`;
      text += `╚════════════════════╝\n\n`;

      const categoryIcons = {
        info: "ℹ️",
        util: "🛠️",
        moderation: "👮",
        owner: "👑",
        other: "📌",
      };

      const categoryNames = {
        info: "Info & Help",
        util: "Utility",
        moderation: "Moderation",
        owner: "Owner Only",
        other: "Other",
      };

      for (const [cat, cmds] of Object.entries(categories)) {
        const icon = categoryIcons[cat] || "📌";
        const catName = categoryNames[cat] || cat;
        text += `${icon} *${catName}* (${cmds.length})\n`;

        for (const cmd of cmds) {
          const badge = cmd.ownerOnly ? "👑" : cmd.adminOnly ? "👮" : "  ";
          const aliases =
            cmd.aliases.length > 0 ? ` [${cmd.aliases.join("/")}]` : "";
          text += `   ${badge} ${prefix}${cmd.name}${aliases}\n`;
        }
        text += "\n";
      }

      text += `💡 Gunakan: ${prefix}help <command> untuk detail\n`;
      text += `📑 Atau: ${prefix}help <category> untuk kategori\n`;
      text += `\nKategori: info, util, moderation, owner`;

      await sock.sendMessage(remoteJid, { text });
    } else if (args.length === 1) {
      const query = args[0].toLowerCase();
      const allCommands = handler.getAllCommands();

      // Cek apakah ada command dengan nama/alias tersebut
      const cmdInfo = handler.getCommandInfo(query);
      if (cmdInfo) {
        // Detail command
        let text = `╔════════════════════╗\n`;
        text += `║  📖 COMMAND DETAIL  ║\n`;
        text += `╚════════════════════╝\n\n`;
        text += `*${cmdInfo.name}*\n`;
        text += `${cmdInfo.description}\n\n`;
        text += `💬 *Usage:*\n${cmdInfo.usage}\n\n`;

        if (cmdInfo.aliases.length > 0) {
          text += `🔗 *Aliases:* ${cmdInfo.aliases.join(", ")}\n\n`;
        }

        const perms = [];
        if (cmdInfo.ownerOnly) perms.push("👑 Owner Only");
        if (cmdInfo.adminOnly) perms.push("👮 Admin Only");

        if (perms.length > 0) {
          text += `🔐 *Permissions:*\n${perms.join("\n")}\n`;
        }

        await sock.sendMessage(remoteJid, { text });
      } else {
        // Cek apakah category
        const categories = {};
        for (const cmd of allCommands) {
          const cat = cmd.category || "other";
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }

        if (categories[query]) {
          const cmds = categories[query];
          let text = `📂 *${query.toUpperCase()} Commands* (${cmds.length})\n\n`;

          for (const cmd of cmds) {
            const badge = cmd.ownerOnly ? "👑" : cmd.adminOnly ? "👮" : "📌";
            const aliases =
              cmd.aliases.length > 0 ? ` (${cmd.aliases.join(", ")})` : "";
            text += `${badge} *${cmd.name}*${aliases}\n`;
            text += `   ${cmd.description}\n\n`;
          }

          await sock.sendMessage(remoteJid, { text });
        } else {
          await sock.sendMessage(remoteJid, {
            text: `❌ Command/Category "${query}" tidak ditemukan`,
          });
        }
      }
    }
  },
};

export default helpCommand;
