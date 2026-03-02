/**
 * Chat Utilities Module
 * 
 * Fungsi-fungsi untuk chat:
 * - Mengirim pesan dengan mention
 * - Mengirim gambar dengan mention
 * - Reply pesan
 * - Deteksi URL
 * - Extract link
 */

import chalk from "chalk";

async function sendMessageWithMention(
  sock,
  remoteJid,
  text,
  message,
  senderType = null
) {
  let mentionedJid = [];

  if (senderType === "user") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  } else if (senderType === "lid") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@lid"
    );
  } else {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  }

  await sock.sendMessage(
    remoteJid,
    {
      text: text,
      contextInfo: {
        mentionedJid,
      },
      ...message,
    },
    { quoted: message }
  );
}

async function sendMessageWithMentionNotQuoted(
  sock,
  remoteJid,
  text,
  senderType = null
) {
  let mentionedJid = [];

  if (senderType === "user") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  } else if (senderType === "lid") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@lid"
    );
  } else {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  }

  await sock.sendMessage(remoteJid, {
    text: text,
    contextInfo: {
      mentionedJid,
    },
  });
}

async function sendImagesWithMentionNotQuoted(
  sock,
  remoteJid,
  buffer,
  text,
  senderType = null
) {
  let mentionedJid = [];

  if (senderType === "user") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  } else if (senderType === "lid") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@lid"
    );
  } else {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  }

  await sock.sendMessage(remoteJid, {
    image: buffer,
    caption: text,
    contextInfo: {
      mentionedJid,
    },
  });
}

async function sendImagesWithMention(
  sock,
  remoteJid,
  buffer,
  text,
  message,
  senderType = null
) {
  let mentionedJid = [];

  if (senderType === "user") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  } else if (senderType === "lid") {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@lid"
    );
  } else {
    mentionedJid = [...text.matchAll(/@(\d{0,16})/g)].map(
      (match) => match[1] + "@s.whatsapp.net"
    );
  }

  return await sock.sendMessage(
    remoteJid,
    {
      image: buffer,
      caption: text,
      contextInfo: {
        mentionedJid,
      },
    },
    { quoted: message }
  );
}

async function reply(m, text) {
  if (!m || !text) {
    throw new Error("Parameter 'm' dan 'text' wajib diisi.");
  }

  const { sock, message, remoteJid } = m;

  if (!sock || !remoteJid || !message) {
    throw new Error(
      "Data yang dibutuhkan (sock, remoteJid, atau message) tidak valid."
    );
  }

  try {
    const result = await sock.sendMessage(
      remoteJid,
      { text },
      { quoted: message }
    );
    return result;
  } catch (error) {
    console.error(`Gagal mengirim pesan: ${error.message}`);
    throw error;
  }
}

function isURL(e) {
  try {
    return new URL(e), !0;
  } catch (e) {
    return !1;
  }
}

function isUrlValid(str) {
  return /https?:\/\/\S+/i.test(str);
}

function isUrlInText(str) {
  const urlPattern =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
  return urlPattern.test(str);
}

function extractLink(text) {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const matches = text.match(urlPattern);
  return matches ? matches[0] : null;
}

export {
  sendMessageWithMention,
  sendMessageWithMentionNotQuoted,
  sendImagesWithMentionNotQuoted,
  sendImagesWithMention,
  reply,
  isURL,
  isUrlValid,
  isUrlInText,
  extractLink,
};
