/**
 * STATUS Command
 * 
 * Tampilkan status bot
 */

import { getCurrentTime } from "../utils/index.js";

const statusCommand = {
  name: "status",
  category: "info",
  description: "Tampilkan status bot",
  usage: ".status",
  aliases: ["info", "botinfo"],

  async execute({ sock, message }) {
    const { remoteJid } = message;

    const time = getCurrentTime();
    const uptime = process.uptime();
    const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text =
      `📊 *Bot Status*\n\n` +
      `✅ Status: Online\n` +
      `⏱️ Waktu: ${time} WIB\n` +
      `⏳ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
      `💾 Memory: ${memory}MB\n` +
      `📱 Node.js: ${process.version}`;

    await sock.sendMessage(remoteJid, { text });
  },
};

export default statusCommand;
