/**
 * Helper Utilities Module
 * 
 * Fungsi-fungsi pembantu:
 * - Logging dengan warna dan timestamp
 * - Console formatting (success, warning, danger)
 * - String manipulation
 * - Utility functions lainnya
 */

import chalk from "chalk";
import crypto from "crypto";
import axios from "axios";

function log(pushname, content) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const time = chalk.blue(`[${hours}:${minutes}]`);
  const title = chalk.yellowBright(pushname);
  const message = chalk.greenBright(content);

  console.log(`${time} ${title} : ${message}`);
}

function logWithTime(pushName, truncatedContent, warna = "hijau") {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const time = chalk.blue(`[${hours}:${minutes}]`);
  const name = chalk.yellow(pushName);

  if (!truncatedContent || typeof truncatedContent !== "string") return;
  const trimmedContent = truncatedContent.trim();
  if (!trimmedContent) {
    return;
  }

  let message;
  switch (warna.toLowerCase()) {
    case "hijau":
      message = chalk.greenBright(trimmedContent);
      break;
    case "merah":
      message = chalk.redBright(trimmedContent);
      break;
    case "biru":
      message = chalk.blueBright(trimmedContent);
      break;
    case "kuning":
      message = chalk.yellowBright(trimmedContent);
      break;
    case "ungu":
      message = chalk.magentaBright(trimmedContent);
      break;
    case "cyan":
      message = chalk.cyanBright(trimmedContent);
      break;
    default:
      message = chalk.greenBright(trimmedContent);
  }
  console.log(`${time} ${name} : ${message}`);
}

function warning(pushName, truncatedContent) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const time = chalk.cyan(`[${hours}:${minutes}]`);
  const name = chalk.yellow(pushName);
  const message = chalk.yellowBright(truncatedContent);

  console.log(`${time} ${name} : ${message}`);
}

function danger(pushName, truncatedContent) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const time = chalk.redBright(`[${hours}:${minutes}]`);
  const name = chalk.redBright(pushName);
  const message = chalk.redBright(truncatedContent);

  console.log(`${time} ${name} : ${message}`);
}

function success(pushName, truncatedContent) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const time = chalk.cyan(`[${hours}:${minutes}]`);
  const name = chalk.greenBright(pushName);
  const message = chalk.greenBright(truncatedContent);

  console.log(`${time} ${name} : ${message}`);
}

function logWithTimestamp(...messages) {
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];
  console.log(`[${time}]`, ...messages);
}

function removeSpace(input) {
  if (!input || typeof input !== "string") return input;

  const characters = input.split("");

  if (characters[1] === " ") {
    characters.splice(1, 1);
  }

  return characters.join("");
}

function toText(input) {
  if (input === null) return "null";
  if (input === undefined) return "undefined";
  if (typeof input === "object") return JSON.stringify(input);
  return String(input);
}

function random(length = 12) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomBytes(1)[0] % charactersLength;
    result += characters[randomIndex];
  }
  return result;
}

function pickRandom(n) {
  return n[Math.floor(Math.random() * n.length)];
}

async function getBuffer(url, options) {
  try {
    options = options || {};
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
      },
      timeout: 45000,
      ...options,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    return false;
  }
}

async function fetchJson(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return res.data;
  } catch (err) {
    console.error(`Error fetching JSON from ${url}:`, err.message);
    return null;
  }
}

function style(
  text,
  styles = "ᴀ ʙ ᴄ ᴅ ᴇ ꜰ ɢ ʜ ɪ ᴊ ᴋ ʟ ᴍ ɴ ᴏ ᴘ Q ʀ ꜱ ᴛ ᴜ ᴠ ᴡ x ʏ ᴢ 0 1 2 3 4 5 6 7 8 9 ᴀ ʙ ᴄ ᴅ ᴇ ꜰ ɢ ʜ ɪ ᴊ ᴋ ʟ ᴍ ɴ ᴏ ᴘ Q ʀ ꜱ ᴛ ᴜ ᴠ ᴡ x ʏ ᴢ"
) {
  if (!text) return false;

  const styleArray = styles.trim().split(/\s+/);
  const charMap = {};

  for (let i = 0; i < 26; i++) {
    charMap[String.fromCharCode(97 + i)] = styleArray[i];
  }
  for (let i = 0; i < 10; i++) {
    charMap[String.fromCharCode(48 + i)] = styleArray[26 + i];
  }
  for (let i = 0; i < 26; i++) {
    charMap[String.fromCharCode(65 + i)] = styleArray[36 + i];
  }

  return [...text.trim()]
    .map((char) => {
      if (char === " ") return char;
      return charMap[char] || char;
    })
    .join("");
}

function readMore() {
  return " .͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏.";
}

function determineUser(mentionedJid, isQuoted, content, senderType = "user") {
  const ext = senderType === "lid" ? "@lid" : "@s.whatsapp.net";

  if (mentionedJid?.[0]) {
    return mentionedJid[0];
  }
  if (isQuoted) {
    return isQuoted.sender;
  }
  const extractedNumber = content.replace(/[^0-9]/g, "");
  return extractedNumber ? `${extractedNumber}${ext}` : null;
}

function getnumberbot(input) {
  let number;

  if (input.includes(":")) {
    number = input.split(":")[0];
  } else if (input.includes("@")) {
    number = input.split("@")[0];
  } else {
    number = null;
  }

  return number;
}

function logTracking(message) {
  // Silent tracking, hanya log ke console jika dibutuhkan
  // console.log(`[TRACKING] ${message}`);
}

function containsViewOnce(obj) {
  if (typeof obj !== "object" || obj === null) return false;

  if ("viewOnce" in obj && obj.viewOnce === true) return true;

  return Object.values(obj).some((value) => containsViewOnce(value));
}

function getMessageType(rawMessageType) {
  const typeAlias = {
    conversation: "text",
    extendedTextMessage: "text",
    senderKeyDistributionMessage: "text",
    imageMessage: "image",
    videoMessage: "video",
    stickerMessage: "sticker",
    audioMessage: "audio",
    documentMessage: "document",
    contactMessage: "contact",
    locationMessage: "location",
    reactionMessage: "reaction",
    templateButtonReplyMessage: "button_reply",
    viewOnceMessageV2: "viewonce",
    pollCreationMessage: "poll",
  };

  return typeAlias[rawMessageType] || "unknown";
}

function isQuotedMessage(message) {
  if (
    message.message &&
    message.message.extendedTextMessage &&
    message.message.extendedTextMessage.contextInfo &&
    message.message.extendedTextMessage.contextInfo.quotedMessage
  ) {
    const quoted =
      message.message.extendedTextMessage.contextInfo.quotedMessage;
    const sender =
      message.message.extendedTextMessage.contextInfo.participant || null;

    if (!sender) return false;

    const rawMessageType = Object.keys(quoted)[0];
    const viewOnce = containsViewOnce(message?.message) ? true : null;

    let messageType = getMessageType(rawMessageType);

    if (viewOnce) {
      messageType = "viewonce";
    }

    const x = `${messageType}Message`;
    const content = quoted[x];
    const textQuoted =
      quoted[rawMessageType]?.text || quoted[rawMessageType] || "";

    const id = message.message.extendedTextMessage.contextInfo.stanzaId || null;

    return {
      sender: sender,
      content: content,
      type: messageType,
      text: textQuoted,
      id: id,
      rawMessageType: rawMessageType || "",
    };
  }

  return false;
}

function getSenderType(sender) {
  if (sender.endsWith("@s.whatsapp.net")) {
    return "user";
  } else if (sender.endsWith("@lid")) {
    return "lid";
  } else if (sender.endsWith("@g.us")) {
    return "group";
  } else {
    return "user-old";
  }
}

async function getName(sock, jid) {
  try {
    const contact = sock.contacts?.[jid];
    if (contact) {
      return contact.name || contact.notify || "+" + jid.split("@")[0];
    }

    if (jid.endsWith("@g.us")) {
      logTracking(`utils.js - groupMetadata (${jid})`);
      const groupMetadata = await sock.groupMetadata(jid);
      return groupMetadata.subject || "Unknown Group";
    }

    return "+" + jid.split("@")[0];
  } catch (error) {
    console.error("Error fetching name:", error.message);
    return "Unknown";
  }
}

async function checkIfAdmin(sock, remoteJid, sender) {
  try {
    logTracking(`utils.js - groupMetadatax (${remoteJid})`);
    if (
      remoteJid.endsWith("@status.broadcast") ||
      remoteJid.endsWith("@broadcast")
    ) {
      console.warn(`Lewati pengambilan metadata untuk broadcast: ${remoteJid}`);
      return null;
    }

    const groupMetadata = await sock.groupMetadata(remoteJid);
    return groupMetadata.participants.some(
      (participant) => participant.id === sender && participant.admin !== null
    );
  } catch (err) {
    console.error("Gagal cek admin:", remoteJid, "-", err.message || err);
    return false;
  }
}

export {
  log,
  logWithTime,
  warning,
  danger,
  success,
  logWithTimestamp,
  removeSpace,
  toText,
  random,
  pickRandom,
  getBuffer,
  fetchJson,
  style,
  readMore,
  determineUser,
  getnumberbot,
  logTracking,
  containsViewOnce,
  getMessageType,
  isQuotedMessage,
  getSenderType,
  getName,
  checkIfAdmin,
};
