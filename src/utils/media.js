/**
 * Media Utilities Module
 * 
 * Fungsi-fungsi untuk mengelola media:
 * - Download media dari pesan
 * - Download media dari quoted message
 * - Konversi audio format
 * - Upload file temporary
 * - Hapus media
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import FormData from "form-data";
import { downloadContentFromMessage } from "baileys";

const baseDir = process.cwd();

function generateUniqueFilename(extension = "m4a") {
  const timestamp = Date.now();
  return `tmp/output_${timestamp}.${extension}`;
}

async function convertAudioToCompatibleFormat(inputPath) {
  const outputFormat = "m4a";
  const outputPath = path.join(baseDir, generateUniqueFilename(outputFormat));

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .inputFormat("mp3")
      .audioCodec("aac")
      .audioFrequency(44100)
      .audioBitrate(128)
      .audioChannels(2)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (error) => {
        reject(error);
      })
      .save(outputPath);
  });
}

async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    throw new Error("Gagal mendownload file: " + error.message);
  }
}

async function forceConvertToM4a(object) {
  const outputPath = path.join(baseDir, generateUniqueFilename());

  let inputPath;
  if (object && object.url) {
    const audioBuffer = await downloadFile(object.url);
    inputPath = path.join(baseDir, generateUniqueFilename("mp3"));
    fs.writeFileSync(inputPath, audioBuffer);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .inputFormat("mp3")
      .audioCodec("aac")
      .audioFrequency(44100)
      .audioBitrate(128)
      .audioChannels(2)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (error) => {
        reject(error);
      })
      .save(outputPath);
  });
}

async function clearDirectory(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error("Error saat menghapus isi folder:", error);
  }
}

async function downloadQuotedMedia(message, folderPath = "./tmp") {
  try {
    const contextInfo = message?.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;

    if (!quotedMessage) {
      console.log("⚠️ Pesan ini tidak mengutip media.");
      return null;
    }

    let mediaType, mediaMessage;

    if (quotedMessage.imageMessage) {
      mediaType = "image";
      mediaMessage = quotedMessage.imageMessage;
    } else if (quotedMessage.videoMessage) {
      mediaType = "video";
      mediaMessage = quotedMessage.videoMessage;
    } else if (quotedMessage.audioMessage) {
      mediaType = "audio";
      mediaMessage = quotedMessage.audioMessage;
    } else if (quotedMessage.documentMessage) {
      mediaType = "document";
      mediaMessage = quotedMessage.documentMessage;
    } else if (quotedMessage.stickerMessage) {
      mediaType = "sticker";
      mediaMessage = quotedMessage.stickerMessage;
    } else if (quotedMessage.viewOnceMessageV2?.message?.imageMessage) {
      mediaType = "image";
      mediaMessage = quotedMessage.viewOnceMessageV2.message.imageMessage;
    } else {
      return null;
    }

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const stream = await downloadContentFromMessage(mediaMessage, mediaType);

    let fileName = mediaMessage.fileName || `${mediaType}_${Date.now()}`;
    const extensionMap = {
      image: ".jpg",
      video: ".mp4",
      audio: ".mp3",
      sticker: ".webp",
    };
    const fileExt =
      mediaType === "document"
        ? path.extname(mediaMessage.fileName || ".bin")
        : extensionMap[mediaType] || "";

    if (!fileName.endsWith(fileExt)) fileName += fileExt;

    const filePath = path.join(folderPath, fileName);

    const buffer = [];
    for await (const chunk of stream) buffer.push(chunk);
    fs.writeFileSync(filePath, Buffer.concat(buffer));

    return filePath;
  } catch (err) {
    console.error("❌ Gagal mengunduh media quoted:", err);
    return null;
  }
}

async function downloadMedia(message, folderPath = "./tmp") {
  if (!message?.message) {
    console.log("⚠️ Pesan tidak mengandung media.");
    return null;
  }

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  let mediaType, mediaMessage;

  if (message.message.imageMessage) {
    mediaType = "image";
    mediaMessage = message.message.imageMessage;
  } else if (message.message.videoMessage) {
    mediaType = "video";
    mediaMessage = message.message.videoMessage;
  } else if (message.message.audioMessage) {
    mediaType = "audio";
    mediaMessage = message.message.audioMessage;
  } else if (message.message.documentMessage) {
    mediaType = "document";
    mediaMessage = message.message.documentMessage;
  } else if (message.message.stickerMessage) {
    mediaType = "sticker";
    mediaMessage = message.message.stickerMessage;
  } else {
    return null;
  }

  const stream = await downloadContentFromMessage(mediaMessage, mediaType);

  let fileName = mediaMessage.fileName || `${mediaType}_${Date.now()}`;
  let fileExt = "";

  switch (mediaType) {
    case "image":
      fileExt = ".jpg";
      break;
    case "video":
      fileExt = ".mp4";
      break;
    case "audio":
      fileExt = ".mp3";
      break;
    case "document":
      fileExt = path.extname(mediaMessage.fileName) || ".bin";
      break;
    case "sticker":
      fileExt = ".webp";
      break;
  }

  if (!fileName.endsWith(fileExt)) fileName += fileExt;

  const filePath = path.join(folderPath, fileName);

  const buffer = [];
  for await (const chunk of stream) buffer.push(chunk);
  fs.writeFileSync(filePath, Buffer.concat(buffer));

  return filePath;
}

async function uploadTmpFile(path, waktu = "1hour") {
  try {
    const form = new FormData();
    form.append("expired", waktu);
    form.append("file", fs.createReadStream(path));

    const response = await axios.put(
      "https://autoresbot.com/tmp-files/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Referer: "https://autoresbot.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Upload error:", error.message);
    return false;
  }
}

function deleteMedia(fileName) {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const mediaFolder = path.join(__dirname, "../database/media");
  const filePath = path.join(mediaFolder, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error saat menghapus file:", err);
        return;
      }
      console.log(`File ${fileName} berhasil dihapus.`);
    });
  } else {
    console.log(`File ${fileName} tidak ditemukan di folder ${mediaFolder}.`);
  }
}

export {
  convertAudioToCompatibleFormat,
  downloadFile,
  forceConvertToM4a,
  clearDirectory,
  downloadQuotedMedia,
  downloadMedia,
  uploadTmpFile,
  deleteMedia,
  generateUniqueFilename,
};
