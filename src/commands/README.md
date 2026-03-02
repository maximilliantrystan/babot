/**
 * Command System - Quick Guide
 * 
 * Cara membuat & mengelola command untuk bot
 */

/**
 * 📝 MEMBUAT COMMAND BARU
 * 
 * 1. Copy file TEMPLATE.js
 *    cp src/commands/TEMPLATE.js src/commands/mycommand.js
 * 
 * 2. Edit file:
 *    - Ubah name
 *    - Ubah description & usage
 *    - Edit execute function
 * 
 * 3. Save - command akan auto-load saat bot start
 */

/**
 * 📋 COMMAND TEMPLATE
 */
const exampleCommand = {
  // 1. Nama command (required, lowercase)
  name: "example",

  // 2. Deskripsi untuk help
  description: "Contoh command",

  // 3. Cara pakai
  usage: ".example [args]",

  // 4. Shortcut alternative
  aliases: ["ex", "exa"],

  // 5. Hanya admin grup
  adminOnly: false,

  // 6. Hanya owner bot
  ownerOnly: false,

  // 7. Execute function
  async execute({ sock, message, args, prefix }) {
    const { remoteJid, sender, isGroup, pushName } = message;

    // Send message
    await sock.sendMessage(remoteJid, {
      text: `Hello ${pushName}!\nArgs: ${args.join(", ")}`,
    });
  },
};

/**
 * 🎯 CONTOH COMMAND REAL
 */

// 1. Simple Text Command
const helloCommand = {
  name: "hello",
  description: "Greet user",
  aliases: ["hi"],
  async execute({ sock, message }) {
    await sock.sendMessage(message.remoteJid, {
      text: `👋 Hello ${message.pushName}!`,
    });
  },
};

// 2. Command dengan Arguments
const calculateCommand = {
  name: "calc",
  description: "Calculator: .calc 5 + 3",
  usage: ".calc <number> <operator> <number>",
  async execute({ sock, message, args }) {
    const [num1, op, num2] = args;
    let result;

    switch (op) {
      case "+":
        result = parseInt(num1) + parseInt(num2);
        break;
      case "-":
        result = parseInt(num1) - parseInt(num2);
        break;
      case "*":
        result = parseInt(num1) * parseInt(num2);
        break;
      case "/":
        result = parseInt(num1) / parseInt(num2);
        break;
      default:
        result = "Operator tidak valid";
    }

    await sock.sendMessage(message.remoteJid, {
      text: `📊 ${num1} ${op} ${num2} = ${result}`,
    });
  },
};

// 3. Admin Only Command
const kickCommand = {
  name: "kick",
  description: "Kick member dari grup",
  usage: ".kick [nomor]",
  adminOnly: true,
  async execute({ sock, message, args }) {
    const number = args[0];
    if (!number) {
      await sock.sendMessage(message.remoteJid, {
        text: "❌ Gunakan: .kick [nomor]",
      });
      return;
    }

    const jid = `${number}@s.whatsapp.net`;
    await sock.groupParticipantsUpdate(message.remoteJid, [jid], "remove");

    await sock.sendMessage(message.remoteJid, {
      text: `👋 Sudah kick member`,
    });
  },
};

// 4. Owner Only Command
const shutdownCommand = {
  name: "shutdown",
  description: "Matikan bot (hanya owner)",
  ownerOnly: true,
  async execute({ sock, message }) {
    await sock.sendMessage(message.remoteJid, {
      text: "👋 Bot sedang shutdown...",
    });
    process.exit(0);
  },
};

/**
 * 🔧 TESTING COMMAND
 * 
 * 1. Start bot: npm start
 * 2. Kirim pesan ke bot: .commandname
 * 3. Lihat di console: ✅ Command executed
 * 
 * atau
 * 
 * .help              - Lihat daftar semua command
 * .help commandname  - Lihat detail command
 * .ping              - Test bot response time
 * .time              - Lihat waktu sekarang
 */

/**
 * 📚 BUILT-IN COMMANDS
 * 
 * - ping      : Test bot response
 * - time      : Show current time/date
 * - help      : List all commands
 */

/**
 * 💡 TIPS
 * 
 * 1. Command names harus lowercase & unique
 * 2. Aliases bisa ada multiple
 * 3. Gunakan message object untuk get info:
 *    - message.sender    : JID pengirim
 *    - message.pushName  : Nama pengirim
 *    - message.isGroup   : Apakah grup
 *    - message.remoteJid : JID tujuan
 *    - message.content   : Isi pesan
 * 
 * 4. Untuk authorization, gunakan message.sender
 * 5. File harus export default commandObject
 * 6. Auto-reload: restart bot untuk load command baru
 */

export default {};
