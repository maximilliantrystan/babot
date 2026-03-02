import { connectToWhatsApp, sessions, serializeMessage } from "./base.js";
import CommandHandler from "./src/commands/handler.js";
import modData from "./src/libs/moderationData.js";

try {
  const { sock, events } = await connectToWhatsApp({
    folder: "session",
    type_connection: "pairing",
    phoneNumber: process.env.PHONE_NUMBER || "628xxxxxxxxx",
    autoread: true,
  });

  // Bersihkan cache files
  sock.clearDirectory("tmp");

  console.log("🚀 Bot sedang menghubungkan ke WhatsApp...");

  // Initialize Command Handler
  const commandHandler = new CommandHandler({
    prefix: ".",
    ownerPhone: process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net",
  });

  // Load commands
  await commandHandler.loadCommands("./src/commands");

  // Set handler reference untuk help command
  const helpCmd = commandHandler.getCommand("help");
  if (helpCmd) helpCmd._handler = commandHandler;

  // 📡 Event: ketika koneksi berhasil
  events.on("connected", () => console.log("✅ Bot berhasil terhubung!"));

  // 💬 Event: pesan masuk dengan command system dan moderation
  events.on("message", async (msg) => {
    try {
      const { remoteJid, sender, content, isGroup } = msg;

      // 🛡️ AUTOMOD CHECK
      if (isGroup && modData.isAutomodEnabled(remoteJid)) {
        const bannedWords = modData.getBannedWords(remoteJid);
        const contentLower = content.toLowerCase();
        let hasViolation = false;

        for (const word of bannedWords) {
          if (contentLower.includes(word)) {
            hasViolation = true;
            break;
          }
        }

        if (hasViolation) {
          // Delete message
          try {
            await sock.sendMessage(msg.m.remoteJid, {
              delete: msg.m.key,
            });
          } catch (e) {
            console.error("Could not delete automod message:", e.message);
          }

          // Add warn
          const warnCount = modData.addWarn(remoteJid, sender);
          const maxWarn = modData.getMaxWarn(remoteJid);

          if (warnCount >= maxWarn) {
            // Kick user
            try {
              await sock.groupParticipantsUpdate(remoteJid, [sender], "remove");
              await sock.sendMessage(remoteJid, {
                text: `🔨 @${sender.split("@")[0]} telah di-kick karena mencapai ${maxWarn} warn`,
              });
            } catch (e) {
              await sock.sendMessage(remoteJid, {
                text: `⚠️  Gagal kick user (pesan terlarang)`,
              });
            }
            modData.resetWarn(remoteJid, sender);
          } else {
            await sock.sendMessage(remoteJid, {
              text: `⚠️  @${sender.split("@")[0]} dilarang menggunakan kata terlarang!\n⚠️  *Warn: ${warnCount}/${maxWarn}*`,
            });
          }
          return;
        }
      }

      // 🔗 ANTILINK CHECK
      if (isGroup && modData.isAntilinkEnabled(remoteJid)) {
        const linkPattern = /chat\.whatsapp\.com|wa\.me|whatsapp\.com/i;
        if (linkPattern.test(content)) {
          // Check daily limit
          const { count, limit, exceeded } = modData.checkAntilinkDaily(
            remoteJid,
            sender
          );

          try {
            await sock.sendMessage(msg.m.remoteJid, {
              delete: msg.m.key,
            });
          } catch (e) {
            console.error("Could not delete antilink message:", e.message);
          }

          if (exceeded) {
            await sock.sendMessage(remoteJid, {
              text: `🔗 @${sender.split("@")[0]} telah melampaui limit ${limit} link per hari\n❌ Pesan dihapus`,
            });
          } else {
            await sock.sendMessage(remoteJid, {
              text: `⚠️  Hati-hati! @${sender.split("@")[0]} sudah mengirim ${count}/${limit} link hari ini`,
            });
          }
          return;
        }
      }

      // Try execute command
      const executed = await commandHandler.execute(msg, sock);

      if (executed) {
        console.log(`✅ Command executed: ${content}`);
      }
    } catch (error) {
      console.error("Error in message handler:", error);
    }
  });

  // 📞 Event: panggilan masuk
  events.on("call", ({ from }) =>
    console.log("📞 Panggilan masuk dari:", from)
  );

  // 👥 Event: grup diperbarui (member join/leave, nama, dll)
  events.on("group-update", (update) =>
    console.log("👥 Grup diperbarui:", update)
  );

  // ❌ Event: koneksi terputus
  events.on("disconnected", (reason) =>
    console.log("❌ Koneksi terputus:", reason)
  );

  console.log("🚀 Bot is running with command system");
} catch (err) {
  console.error("❗ Gagal menghubungkan bot:", err.message);
}
