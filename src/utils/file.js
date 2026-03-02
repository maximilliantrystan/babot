/**
 * File Utilities Module
 * 
 * Fungsi-fungsi untuk mengelola file:
 * - Setup direktori session
 * - Hapus folder rekursif
 * - Deteksi Docker environment
 * - Buat backup
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import chalk from "chalk";

function setupSessionDirectory(sessionDir) {
  try {
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    fs.chmodSync(sessionDir, 0o755);

    const files = fs.readdirSync(sessionDir);
    files.forEach((file) => {
      const filePath = path.join(sessionDir, file);
      try {
        fs.chmodSync(filePath, 0o644);
      } catch (err) {
        console.error(`Error changing file permissions for ${filePath}:`, err);
      }
    });
  } catch (err) {
    console.error("Error setting up session directory:", err);
  }
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  } else {
    console.log("Folder does not exist:", folderPath);
  }
}

async function clearFolder(folderPath) {
  try {
    const files = await fsp.readdir(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = await fsp.lstat(filePath);
      if (stat.isDirectory()) {
        await clearFolder(filePath);
        await fsp.rmdir(filePath);
      } else {
        await fsp.unlink(filePath);
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Gagal menghapus folder:", err);
  }
}

async function createBackup() {
  const start = Date.now();
  const projectPath = process.cwd();
  const backupFilePath = path.join(projectPath, `autoresbot backup.zip`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(backupFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      const end = Date.now();
      const duration = ((end - start) / 1000).toFixed(3);

      const stats = fs.statSync(backupFilePath);
      let size = stats.size / 1024;
      let sizeUnit = "KB";

      if (size >= 1024) {
        size = size / 1024;
        sizeUnit = "MB";
      }

      resolve({
        path: backupFilePath,
        time: `${duration} seconds`,
        size: `${size.toFixed(2)} ${sizeUnit}`,
      });
    });

    archive.on("error", (err) => reject(err));
    archive.pipe(output);

    archive.glob("**/*", {
      cwd: projectPath,
      ignore: [
        "tmp/**",
        "session/**",
        "logs/**",
        "node_modules/**",
        "autoresbot backup.zip",
      ],
    });

    archive.finalize();
  });
}

function isDocker() {
  const path = "/proc/1/cgroup";
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, "utf-8");
    if (content.includes("docker")) {
      return true;
    }
  }
  return false;
}

export {
  setupSessionDirectory,
  deleteFolderRecursive,
  clearFolder,
  createBackup,
  isDocker,
};
