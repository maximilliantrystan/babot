/**
 * PING Command
 * 
 * Utility command untuk cek bot status
 */

const pingCommand = {
  name: "ping",
  category: "info",
  description: "Cek apakah bot aktif",
  usage: ".ping",
  aliases: ["pong"],

  async execute({ sock, message, prefix }) {
    const { remoteJid } = message;
    const startTime = Date.now();

    const sentMsg = await sock.sendMessage(remoteJid, {
      text: "🏓 Pong!",
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await sock.sendMessage(
      remoteJid,
      {
        text: `Response time: ${responseTime}ms`,
      },
      { quoted: sentMsg }
    );
  },
};

export default pingCommand;
