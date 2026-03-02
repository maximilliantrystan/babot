/**
 * Main Export Module
 * 
 * Mengeksport fungsi-fungsi utama bot:
 * - connectToWhatsApp: Menghubungkan ke WhatsApp
 * - sessions: Manajemen session
 * - serializeMessage: Format pesan standar
 */

import connectToWhatsApp from "./src/core/connect.js";
import { sessions } from "./src/services/cache.js";
import serializeMessage from "./src/services/message.js";

export { connectToWhatsApp, sessions, serializeMessage };
