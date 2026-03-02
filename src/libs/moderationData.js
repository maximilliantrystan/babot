/**
 * Moderation Data Manager
 * Handle storage untuk automod dan antilink per grup
 * Menggunakan JSON file untuk persistence
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");
const MOD_FILE = path.join(DATA_DIR, "moderation.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class ModerationData {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(MOD_FILE)) {
        return JSON.parse(fs.readFileSync(MOD_FILE, "utf8"));
      }
    } catch (error) {
      console.error("Error loading moderation data:", error);
    }
    return {};
  }

  saveData() {
    try {
      fs.writeFileSync(MOD_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("Error saving moderation data:", error);
    }
  }

  /**
   * Initialize group moderation settings
   */
  initGroup(groupId) {
    if (!this.data[groupId]) {
      this.data[groupId] = {
        automod: {
          enabled: false,
          maxWarn: 3,
          bannedWords: [],
          userWarns: {}, // { userId: warnCount }
        },
        antilink: {
          enabled: false,
          maxPerDay: 1,
          dailyLinks: {}, // { "YYYY-MM-DD": { userId: count } }
        },
      };
      this.saveData();
    }
  }

  // ========== AUTOMOD ==========

  /**
   * Add banned word
   */
  addBannedWord(groupId, word) {
    this.initGroup(groupId);
    const word_lower = word.toLowerCase();
    if (!this.data[groupId].automod.bannedWords.includes(word_lower)) {
      this.data[groupId].automod.bannedWords.push(word_lower);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Remove banned word
   */
  removeBannedWord(groupId, word) {
    this.initGroup(groupId);
    const word_lower = word.toLowerCase();
    const index = this.data[groupId].automod.bannedWords.indexOf(word_lower);
    if (index > -1) {
      this.data[groupId].automod.bannedWords.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Get all banned words for group
   */
  getBannedWords(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].automod.bannedWords;
  }

  /**
   * Enable/disable automod
   */
  setAutomodStatus(groupId, enabled) {
    this.initGroup(groupId);
    this.data[groupId].automod.enabled = enabled;
    this.saveData();
  }

  /**
   * Get automod status
   */
  isAutomodEnabled(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].automod.enabled;
  }

  /**
   * Set max warnings
   */
  setMaxWarn(groupId, maxWarn) {
    this.initGroup(groupId);
    this.data[groupId].automod.maxWarn = Math.max(1, maxWarn);
    this.saveData();
  }

  /**
   * Get max warnings
   */
  getMaxWarn(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].automod.maxWarn;
  }

  /**
   * Add warn to user
   */
  addWarn(groupId, userId) {
    this.initGroup(groupId);
    if (!this.data[groupId].automod.userWarns[userId]) {
      this.data[groupId].automod.userWarns[userId] = 0;
    }
    this.data[groupId].automod.userWarns[userId]++;
    this.saveData();
    return this.data[groupId].automod.userWarns[userId];
  }

  /**
   * Get user warns count
   */
  getWarnCount(groupId, userId) {
    this.initGroup(groupId);
    return this.data[groupId].automod.userWarns[userId] || 0;
  }

  /**
   * Reset warns for user
   */
  resetWarn(groupId, userId) {
    this.initGroup(groupId);
    delete this.data[groupId].automod.userWarns[userId];
    this.saveData();
  }

  /**
   * Reset all warns for group
   */
  resetAllWarns(groupId) {
    this.initGroup(groupId);
    this.data[groupId].automod.userWarns = {};
    this.saveData();
  }

  // ========== ANTILINK ==========

  /**
   * Enable/disable antilink
   */
  setAntilinkStatus(groupId, enabled) {
    this.initGroup(groupId);
    this.data[groupId].antilink.enabled = enabled;
    this.saveData();
  }

  /**
   * Get antilink status
   */
  isAntilinkEnabled(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].antilink.enabled;
  }

  /**
   * Set max links per day
   */
  setAntilinkLimit(groupId, maxPerDay) {
    this.initGroup(groupId);
    this.data[groupId].antilink.maxPerDay = Math.max(1, maxPerDay);
    this.saveData();
  }

  /**
   * Get max links per day
   */
  getAntilinkLimit(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].antilink.maxPerDay;
  }

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  /**
   * Check and increment link counter
   * Returns { count, limit, exceeded }
   */
  checkAntilinkDaily(groupId, userId) {
    this.initGroup(groupId);
    const today = this.getTodayDate();

    // Initialize today's data if not exists
    if (!this.data[groupId].antilink.dailyLinks[today]) {
      this.data[groupId].antilink.dailyLinks[today] = {};
    }

    // Initialize user's count if not exists
    if (!this.data[groupId].antilink.dailyLinks[today][userId]) {
      this.data[groupId].antilink.dailyLinks[today][userId] = 0;
    }

    // Increment count
    this.data[groupId].antilink.dailyLinks[today][userId]++;
    const count = this.data[groupId].antilink.dailyLinks[today][userId];
    const limit = this.getAntilinkLimit(groupId);

    this.saveData();

    return {
      count,
      limit,
      exceeded: count > limit,
    };
  }

  /**
   * Clean up old daily link data (older than 7 days)
   */
  cleanupOldAntilinkData(groupId) {
    this.initGroup(groupId);
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    for (const date in this.data[groupId].antilink.dailyLinks) {
      if (date < sevenDaysAgo) {
        delete this.data[groupId].antilink.dailyLinks[date];
      }
    }
    this.saveData();
  }

  /**
   * Get all settings for a group
   */
  getGroupSettings(groupId) {
    this.initGroup(groupId);
    return JSON.parse(JSON.stringify(this.data[groupId]));
  }

  /**
   * Reset group moderation data
   */
  resetGroup(groupId) {
    delete this.data[groupId];
    this.saveData();
  }
}

export default new ModerationData();
