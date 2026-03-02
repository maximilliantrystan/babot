/**
 * Update index.js untuk menggunakan Command Handler
 * 
 * Letakkan kode ini di index.js setelah connectToWhatsApp
 */

import CommandHandler from "./src/commands/handler.js";

const { sock, events } = await connectToWhatsApp({
  folder: "session",
  type_connection: "pairing",
  phoneNumber: process.env.PHONE_NUMBER || "628xxxxxxxxx",
  autoread: true,
});

// Initialize Command Handler
const commandHandler = new CommandHandler({
  prefix: ".",
  ownerPhone: process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net",
});

// Load commands
await commandHandler.loadCommands("./src/commands");

// Set handler reference untuk help command
const helpCmd = commandHandler.getCommand("help");
if (helpCmd) helpCmd._handler = commandHandler;

// Handle messages dengan command system
events.on("message", async (msg) => {
  try {
    // Try execute command
    const executed = await commandHandler.execute(msg, sock);

    if (executed) {
      console.log(`✅ Command executed: ${msg.content}`);
    }
  } catch (error) {
    console.error("Error in message handler:", error);
  }
});

console.log("🚀 Bot is running with command system");
