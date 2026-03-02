/**
 * Message Serializer Module
 * 
 * Mengubah raw message dari Baileys menjadi format yang mudah digunakan.
 * 
 * Fitur:
 * - Extract teks dari berbagai jenis pesan
 * - Deteksi quoted message
 * - Deteksi mention
 * - Identifikasi jenis pesan
 * - Format timestamp
 * 
 * Output terstandar untuk semua pesan masuk.
 */

import {
  removeSpace,
  isQuotedMessage,
  getMessageType,
  getSenderType,
  logWithTimestamp,
} from "../utils/index.js";
import { getContentType } from "baileys";

// Inisialisasi Map
const messageMap = new Map();

function time() {
  const now = new Date();
  const jam = now.getHours().toString().padStart(2, "0");
  const menit = now.getMinutes().toString().padStart(2, "0");
  return `${jam}:${menit}`;
}

// Fungsi untuk insert data ke dalam Map
function insertMessage(id, participant, messageTimestamp, remoteId) {
  messageMap.set(id, {
    participant,
    messageTimestamp,
    remoteId,
  });
}

function updateMessagePartial(id, partialData = {}) {
  if (messageMap.has(id)) {
    const current = messageMap.get(id);
    messageMap.set(id, { ...current, ...partialData });
  } else {
    console.log(`Data dengan id ${id} tidak ditemukan.`);
  }
}

function serializeMessage(m, sock) {
  try {
    const timestamp = m.messages?.[0]?.messageTimestamp;
    const now = Math.floor(Date.now() / 1000);
    const diffInSeconds = now - timestamp;

    if (diffInSeconds > 30) {
      return null;
    }

    if (!m || !m.messages || !m.messages[0]) return null;
    if (m.type === "append") return null;

    const message = m.messages[0];

    const key = message.key || {};
    const remoteJid = key.remoteJid || "";
    const fromMe = key.fromMe || false;
    const id = key.id || "";
    const participant =
      key.participantAlt || key.participant || message.participant || "";
    const pushName = message.pushName || "";
    const isGroup = remoteJid.endsWith("@g.us");
    const isBroadcast = remoteJid.endsWith("status@broadcast");
    let sender = isGroup ? participant : remoteJid;

    let senderType = getSenderType(sender); // lid user group user-old

    const isQuoted = isQuotedMessage(message); // pesan yang mengutip pesan lain
    const isEdited =
      message?.message?.protocolMessage?.editedMessage?.extendedTextMessage
        ?.text ||
      message?.message?.protocolMessage?.editedMessage?.conversation ||
      message?.message?.editedMessage ||
      null;
    const isDeleted = message?.message?.protocolMessage?.type === 0;
    const isForwarded =
      message.message?.[getContentType(message.message)]?.contextInfo
        ?.isForwarded === true;

    let antitagsw = false;
    let isTagMeta = false;

    let objisEdited = {};
    if (isEdited) {
      const messageId = m.messages[0]?.message?.protocolMessage?.key?.id;
      objisEdited = {
        status: true,
        id: messageId || null,
        text: isEdited,
      };
    }

    const isBot =
      (id?.startsWith("3EB0") && id.length === 22) ||
      (message?.message &&
        Object.keys(message.message).some((key) =>
          ["templateMessage", "interactiveMessage", "buttonsMessage"].includes(
            key
          )
        ));

    antitagsw = !!(
      message?.message?.groupStatusMentionMessage ||
      message?.message?.groupStatusMentionMessage?.message?.protocolMessage
        ?.type === "STATUS_MENTION_MESSAGE"
    );

    if (message?.message?.senderKeyDistributionMessage) {
      //console.log(JSON.stringify(message, null, 2));
      //return;
    }

    if (remoteJid === "status@broadcast") {
      if (message?.message?.senderKeyDistributionMessage) {
        antitagsw = true;
        sender = participant;
      }
      //return null;
    }

    let content = "";
    let messageType = "";

    if (message?.message?.stickerMessage) {
      content = "stickerMessage";
    } else {
      content =
        message?.message?.conversation ||
        message?.message?.extendedTextMessage?.text ||
        message?.message?.imageMessage?.caption ||
        message?.message?.videoMessage?.caption ||
        message?.message?.documentMessage?.caption ||
        message?.message?.text ||
        message?.message?.selectedButtonId ||
        message?.message?.singleSelectReply?.selectedRowId ||
        message?.message?.selectedId ||
        message?.message?.contentText ||
        message?.message?.selectedDisplayText ||
        message?.message?.title ||
        "";
    }

    if (message.message) {
      const rawMessageType = getContentType(message.message);
      isTagMeta = Boolean(rawMessageType === "botInvokeMessage");

      messageType = Object.keys(message.message)[0];
      content =
        messageType === "conversation"
          ? message.message.conversation
          : messageType === "extendedTextMessage"
          ? message.message.extendedTextMessage.text
          : messageType === "senderKeyDistributionMessage"
          ? message.message.conversation
          : messageType === "imageMessage"
          ? message.message.imageMessage.caption || ""
          : messageType === "videoMessage"
          ? message.message.videoMessage.caption || ""
          : messageType === "stickerMessage"
          ? "stickerMessage"
          : messageType === "audioMessage"
          ? "audioMessage"
          : messageType === "templateButtonReplyMessage"
          ? message.message.templateButtonReplyMessage.selectedId
          : "";

      if (message?.message?.reactionMessage && message?.reaction) {
        const emoji = message.reaction?.text || "[REACT DIHAPUS]";
        const reactedToMsgId =
          message.reaction?.key?.id || "[ID TIDAK TERDETEKSI]";
        const reactedBy = message.reaction?.key?.participant || "diri sendiri";
        messageType = "reactionMessage";
        content = emoji;
      }

      if (message?.message?.documentMessage) {
        const doc = message.message.documentMessage;
        const namaFile = doc.fileName || "Tidak diketahui";
        messageType = "documentMessage";
        content = namaFile;
      }

      if (!content) {
        // console.log('392 --- NO CONTENT -------')
        // console.log(JSON.stringify(message, null, 2))
        //return null;
      }
    } else {
      //console.log('message.message null!')
      //console.log(JSON.stringify(m, null, 2));
      return null;
    }

    content = removeSpace(content) || "";
    // Ambil kata pertama sebagai command
    const command = content.split(" ")[0]?.toLowerCase() || "";

    const contentWithoutCommand = content;

    const quotedMessage = isQuoted
      ? {
          text:
            message.message.extendedTextMessage.contextInfo.quotedMessage
              ?.conversation || "",
          sender:
            message.message.extendedTextMessage.contextInfo.participant || "",
          id: message.message.extendedTextMessage.contextInfo.stanzaId || "",
        }
      : null;

    const ArraymentionedJid =
      message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || false;
    const cleanContent = content.replace(/\s+/g, " ").trim();
    const preview =
      cleanContent.length > 20
        ? cleanContent.slice(0, 20) + "..."
        : cleanContent;
    const senderNumber = participant.replace(/@s\.whatsapp\.net$/, "");

    if (message?.message?.protocolMessage?.type === 17) {
      return;
    }

    if (messageType == "senderKeyDistributionMessage" && !content) {
      return null;
    }

    if (!content) {
      const ignoredTypes = [
        "senderKeyDistributionMessage",
        "albumMessage",
        "imageMessage",
        "videoMessage",
        "messageContextInfo",
      ];
      if (!ignoredTypes.includes(messageType)) {
        // logWithTimestamp('--- NO CONTENT OPEN ----');
        // logWithTimestamp('--- messageType :', messageType);
      }
    }

    const obj = {
      id,
      timestamp: message.messageTimestamp,
      sender,
      pushName,
      isGroup,
      fromMe,
      remoteJid,
      type: getMessageType(messageType),
      content: contentWithoutCommand,
      message,
      isTagSw: antitagsw,
      prefix: "",
      command,
      fullText: content,
      isQuoted,
      quotedMessage,
      mentionedJid: ArraymentionedJid,
      isBot,
      isTagMeta,
      isForwarded,
      senderType,
      m: { remoteJid, key, message, sock, isDeleted, isEdited: objisEdited, m },
    };
    return obj;
  } catch (e) {
    console.log("Error serializing message:", e);
    return null;
  }
}

export default serializeMessage;
