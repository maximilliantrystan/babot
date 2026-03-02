/**
 * ECHO Command
 * 
 * Echo text back - contoh command dengan arguments
 */

const echoCommand = {
  name: "echo",
  category: "util",
  description: "Repeat text yang dikirim",
  usage: ".echo <text>",
  aliases: ["say", "repeat"],

  async execute({ sock, message, args }) {
    const { remoteJid } = message;

    if (args.length === 0) {
      await sock.sendMessage(remoteJid, {
        text: "❌ Gunakan: .echo <text>",
      });
      return;
    }

    const text = args.join(" ");
    await sock.sendMessage(remoteJid, {
      text: `🔊 ${text}`,
    });
  },
};

export default echoCommand;
