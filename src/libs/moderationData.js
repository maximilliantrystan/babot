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
        admins: [], // Custom admins list [{phone: string, level: number}]
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
    } else {
      // Migrate old data format (admins was array of strings, now it's array of objects)
      if (this.data[groupId].admins && Array.isArray(this.data[groupId].admins)) {
        if (this.data[groupId].admins.length > 0 && typeof this.data[groupId].admins[0] === 'string') {
          // Old format: convert to new format
          this.data[groupId].admins = this.data[groupId].admins.map(phone => ({
            phone,
            level: 1
          }));
          this.saveData();
        }
      }
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

  // ========== CUSTOM ADMINS ==========

  /**
   * Add custom admin untuk grup dengan level system
   * Level: 4 = super admin (bisa add admin level 1-3)
   *        3 = moderator (bisa add admin level 1-2)
   *        2 = helper (no permission to add)
   *        1 = junior helper (no permission to add)
   */
  addAdmin(groupId, phoneNumber, level = 1) {
    this.initGroup(groupId);
    const normalized = phoneNumber.includes("@")
      ? phoneNumber.split("@")[0]
      : phoneNumber;

    const existing = this.data[groupId].admins.find(
      (a) => a.phone === normalized
    );
    if (!existing) {
      this.data[groupId].admins.push({ phone: normalized, level: Math.min(level, 4) });
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Update admin level
   */
  updateAdminLevel(groupId, phoneNumber, newLevel) {
    this.initGroup(groupId);
    const normalized = phoneNumber.includes("@")
      ? phoneNumber.split("@")[0]
      : phoneNumber;

    const admin = this.data[groupId].admins.find((a) => a.phone === normalized);
    if (admin) {
      admin.level = Math.min(newLevel, 4);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Remove custom admin dari grup
   */
  removeAdmin(groupId, phoneNumber) {
    this.initGroup(groupId);
    const normalized = phoneNumber.includes("@")
      ? phoneNumber.split("@")[0]
      : phoneNumber;

    const index = this.data[groupId].admins.findIndex(
      (a) => a.phone === normalized
    );
    if (index > -1) {
      this.data[groupId].admins.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Check if user is custom admin
   */
  isCustomAdmin(groupId, phoneNumber) {
    try {
      this.initGroup(groupId);
      const normalized = phoneNumber.includes("@")
        ? phoneNumber.split("@")[0]
        : phoneNumber;

      const groupData = this.data[groupId];
      if (!groupData || !groupData.admins) return false;
      
      const admins = groupData.admins;
      if (!Array.isArray(admins) || admins.length === 0) return false;
      
      // Handle both old format (string) and new format (object)
      for (const admin of admins) {
        if (typeof admin === 'string' && admin === normalized) {
          return true;
        } else if (typeof admin === 'object' && admin?.phone === normalized) {
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Error in isCustomAdmin:", e);
      return false;
    }
  }

  /**
   * Get admin level
   * Returns: number 1-4, or 0 if not admin
   */
  getAdminLevel(groupId, phoneNumber) {
    try {
      this.initGroup(groupId);
      const normalized = phoneNumber.includes("@")
        ? phoneNumber.split("@")[0]
        : phoneNumber;

      const groupData = this.data[groupId];
      if (!groupData || !groupData.admins) return 0;

      const admins = groupData.admins;
      if (!Array.isArray(admins)) return 0;
      
      // Handle both old format (string) and new format (object)
      for (const admin of admins) {
        if (typeof admin === 'string' && admin === normalized) {
          return 1;
        } else if (typeof admin === 'object' && admin?.phone === normalized) {
          return admin.level || 1;
        }
      }
      return 0;
    } catch (e) {
      console.error("Error in getAdminLevel:", e);
      return 0;
    }
  }

  /**
   * Check if admin can add another admin with target level
   * Rules:
   * - Owner (level 5+): Can add admin level 1-4
   * - Level 4: Can add admin level 1-3
   * - Level 3: Can add admin level 1-2
   * - Level 1-2: Cannot add
   */
  canAddAdmin(groupId, adderPhone, targetLevel) {
    const adderLevel = this.getAdminLevel(groupId, adderPhone);
    return adderLevel >= targetLevel + 1 && adderLevel >= 3;
  }

  /**
   * Get all custom admins
   */
  getAdmins(groupId) {
    this.initGroup(groupId);
    return this.data[groupId].admins;
  }

  /**
   * Get admin info by phone
   */
  getAdminInfo(groupId, phoneNumber) {
    try {
      this.initGroup(groupId);
      const normalized = phoneNumber.includes("@")
        ? phoneNumber.split("@")[0]
        : phoneNumber;

      const groupData = this.data[groupId];
      if (!groupData || !groupData.admins) return null;

      const admins = groupData.admins;
      if (!Array.isArray(admins)) return null;
      
      // Handle both old format (string) and new format (object)
      for (const admin of admins) {
        if (typeof admin === 'string' && admin === normalized) {
          return { phone: normalized, level: 1 };
        } else if (typeof admin === 'object' && admin?.phone === normalized) {
          return admin;
        }
      }
      return null;
    } catch (e) {
      console.error("Error in getAdminInfo:", e);
      return null;
    }
  }
}

export default new ModerationData();
