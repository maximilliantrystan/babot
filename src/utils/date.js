/**
 * Date & Time Utilities Module
 * 
 * Fungsi-fungsi untuk penanganan waktu:
 * - Get waktu saat ini (WIB)
 * - Get tanggal saat ini
 * - Format durasi
 * - Selisih hari
 * - Informasi hari (Senin, Selasa, dll)
 * - Get sapaan (Pagi, Siang, Sore, Malam)
 */

import {
  format,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import moment from "moment-timezone";

function getCurrentTime() {
  const now = moment().tz("Asia/Jakarta");
  const hours = String(now.hour()).padStart(2, "0");
  const minutes = String(now.minute()).padStart(2, "0");
  const seconds = String(now.second()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getCurrentDate() {
  const now = moment().tz("Asia/Jakarta");
  const day = now.date();
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const month = monthNames[now.month()];
  const year = now.year();

  return `${day} ${month} ${year}`;
}

function formatDuration(lastChat) {
  const now = new Date();
  const lastDate = new Date(lastChat);

  const diffInSeconds = differenceInSeconds(now, lastDate);
  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;

  const diffInMinutes = differenceInMinutes(now, lastDate);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;

  const diffInHours = differenceInHours(now, lastDate);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

  const diffInDays = differenceInDays(now, lastDate);
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

  return format(lastDate, "dd MMM yyyy, HH:mm");
}

function formatRemainingTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let timeString = "";
  if (days > 0) {
    timeString += `${days} hari `;
  }
  if (hours > 0) {
    timeString += `${hours} jam `;
  }
  if (minutes > 0) {
    timeString += `${minutes} menit `;
  }
  timeString += `${remainingSeconds} detik`;

  return timeString;
}

function selisihHari(endDate) {
  const now = new Date();
  const timeDifference = new Date(endDate).getTime() - now.getTime();
  const daysLeft = Math.floor(timeDifference / 864e5);
  const hoursLeft = Math.floor((timeDifference % 864e5) / 36e5);
  const minutesLeft = Math.floor((timeDifference % 36e5) / 6e4);
  const secondsLeft = Math.floor((timeDifference % 6e4) / 1e3);

  if (daysLeft === 0) {
    return `Hari ini, tersisa ${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik lagi`;
  } else if (daysLeft === 1) {
    return `Besok, tersisa 1 Hari ${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik lagi`;
  } else if (daysLeft === -1) {
    return "Kemarin";
  } else if (daysLeft > 1) {
    return `${daysLeft} hari mendatang`;
  } else if (daysLeft < -1) {
    return `${Math.abs(daysLeft)} hari yang lalu`;
  }
  return undefined;
}

function getHari() {
  const hariIndonesia = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  const now = new Date();
  const indexHari = now.getDay();

  return hariIndonesia[indexHari];
}

function getGreeting() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const wibHours = (utcHours + 7) % 24;

  if (wibHours >= 5 && wibHours <= 10) {
    return "Pagi";
  } else if (wibHours >= 11 && wibHours < 15) {
    return "Siang";
  } else if (wibHours >= 15 && wibHours <= 18) {
    return "Sore";
  } else if (wibHours > 18 && wibHours <= 19) {
    return "Petang";
  } else {
    return "Malam";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
  getCurrentTime,
  getCurrentDate,
  formatDuration,
  formatRemainingTime,
  selisihHari,
  getHari,
  getGreeting,
  sleep,
};
