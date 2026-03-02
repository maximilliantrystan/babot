/**
 * Configuration Module
 * 
 * Default configuration untuk bot WhatsApp.
 * Dapat di-override dengan environment variables.
 */

export const config = {
  // Session settings
  session: {
    folder: process.env.SESSION_FOLDER || "session",
    type: process.env.CONNECTION_TYPE || "qr", // 'qr' atau 'pairing'
    phoneNumber: process.env.PHONE_NUMBER || null,
  },

  // Bot settings
  bot: {
    autoread: process.env.AUTO_READ === "true" || true,
    prefix: process.env.BOT_PREFIX || ".",
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || "info",
    directory: process.env.LOG_DIR || "logs",
  },

  // Cache settings
  cache: {
    ttl: process.env.CACHE_TTL || 3600, // 1 jam dalam detik
  },

  // Validation rules
  validations: [
    {
      key: "type_connection",
      validValues: ["pairing", "qr"],
      errorMessage: "Type connection hanya pairing atau qr",
    },
    {
      key: "phone_number_bot",
      validate: (value) => value && value.length >= 7,
      errorMessage: "Pastikan NOMOR_BOT valid",
    },
    {
      key: "bot_destination",
      validValues: ["group", "private", "both"],
      errorMessage: "Destination hanya group, private atau both",
    },
    {
      key: "mode",
      validValues: ["production", "development"],
      errorMessage: "Mode hanya production dan development",
    },
  ],
};

export default config;
