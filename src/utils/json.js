/**
 * JSON Utilities Module
 * 
 * Fungsi-fungsi untuk mengelola file JSON:
 * - Baca file JSON
 * - Tambah entry ke JSON
 * - Update entry JSON
 * - Hapus entry JSON
 */

import fsp from "fs/promises";

async function readJsonFile(filePath) {
  try {
    const data = await fsp.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error membaca file JSON:", error);
    return {};
  }
}

async function addJsonEntry(filePath, newEntry, key) {
  try {
    const data = await readJsonFile(filePath);

    if (Array.isArray(data)) {
      data.push(newEntry);
    } else if (typeof data === "object") {
      if (!key) {
        throw new Error(
          "Key harus disediakan untuk menambahkan data ke objek."
        );
      }
      if (data[key]) {
        console.warn(`Key "${key}" sudah ada. Data akan ditimpa.`);
      }
      data[key] = newEntry;
    } else {
      throw new Error(
        "Format JSON tidak dikenali. Harus berupa array atau object."
      );
    }

    await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error menambah data ke file JSON:", error);
  }
}

async function updateJsonEntry(filePath, idUnix, updatedData) {
  try {
    const data = await readJsonFile(filePath);

    if (data[idUnix]) {
      data[idUnix] = { ...data[idUnix], ...updatedData };
      console.log(`Data dengan ID ${idUnix} berhasil diperbarui.`);
    } else {
      console.log(`ID ${idUnix} tidak ditemukan.`);
    }

    await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error mengupdate data di file JSON:", error);
  }
}

async function deleteJsonEntry(filePath, key) {
  try {
    const data = await readJsonFile(filePath);

    if (Array.isArray(data)) {
      const filteredData = data.filter((item) => item.id !== key);
      if (filteredData.length === data.length) {
        console.warn(`Tidak ada data dengan key "${key}" yang ditemukan.`);
      } else {
        console.log(`Data dengan key "${key}" berhasil dihapus.`);
      }

      await fsp.writeFile(
        filePath,
        JSON.stringify(filteredData, null, 2),
        "utf8"
      );
    } else if (typeof data === "object") {
      if (data[key]) {
        delete data[key];
        console.log(`Data dengan key "${key}" berhasil dihapus.`);
      } else {
        console.warn(`Tidak ada data dengan key "${key}" yang ditemukan.`);
      }

      await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } else {
      throw new Error(
        "Format JSON tidak dikenali. Harus berupa array atau object."
      );
    }
  } catch (error) {
    console.error("Error menghapus data dari file JSON:", error);
  }
}

export { readJsonFile, addJsonEntry, updateJsonEntry, deleteJsonEntry };
