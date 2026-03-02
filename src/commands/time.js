/**
 * TIME Command
 * 
 * Tampilkan waktu saat ini
 */

import { getCurrentTime, getCurrentDate, getGreeting } from "../utils/index.js";

const timeCommand = {
  name: "time",
  category: "info",
  description: "Tampilkan tanggal & waktu sekarang",
  usage: ".time",
  aliases: ["jam", "tanggal"],

  async execute({ sock, message }) {
    const { remoteJid } = message;

    const time = getCurrentTime();
    const date = getCurrentDate();
    const greeting = getGreeting();

    const text = `⏰ *Waktu Sekarang*\n\n` +
      `Greeting: ${greeting}\n` +
      `Tanggal: ${date}\n` +
      `Waktu: ${time} WIB`;

    await sock.sendMessage(remoteJid, { text });
  },
};

export default timeCommand;
