/**
 * Command Handler & Registry
 * 
 * Mengelola semua command bot:
 * - Load commands dari folder
 * - Execute command dengan validasi
 * - Handle permissions & errors
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import chalk from "chalk";
import modData from "../libs/moderationData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CommandHandler {
  constructor(config = {}) {
    this.commands = new Map();
    this.aliases = new Map();
    this.prefix = config.prefix || ".";
    this.ownerPhone = config.ownerPhone || null;
  }

  /**
   * Load commands dari folder
   * @param {string} commandsPath - Path ke folder commands
   */
  async loadCommands(commandsPath = __dirname) {
    try {
      const files = fs.readdirSync(commandsPath);

      for (const file of files) {
        if (file === "index.js" || file.startsWith("_")) continue;

        const filePath = path.join(commandsPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursive load dari subfolder
          await this.loadCommands(filePath);
        } else if (file.endsWith(".js")) {
          try {
            const module = await import(pathToFileURL(filePath).href);
            const command = module.default;

            if (!command || !command.name) {
              console.warn(`⚠️  Command di ${file} tidak valid (missing name)`);
              continue;
            }

            this.register(command);
            console.log(
              chalk.greenBright(
                `✅ Command loaded: ${chalk.yellow(command.name)}`
              )
            );
          } catch (error) {
            console.error(
              chalk.redBright(`❌ Error loading ${file}:`),
              error.message
            );
          }
        }
      }

      console.log(
        chalk.cyan(`\n📋 Total commands loaded: ${this.commands.size}\n`)
      );
    } catch (error) {
      console.error(chalk.redBright("Error loading commands:"), error);
    }
  }

  /**
   * Register command
   */
  register(command) {
    if (!command.name) {
      throw new Error("Command must have a name");
    }

    // Register main command
    this.commands.set(command.name.toLowerCase(), command);

    // Register aliases
    if (command.aliases && Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      }
    }
  }

  /**
   * Get command by name or alias
   */
  getCommand(nameOrAlias) {
    const name = nameOrAlias.toLowerCase();
    const actualName = this.aliases.get(name) || name;
    return this.commands.get(actualName);
  }

  /**
   * Execute command dengan validasi
   */
  async execute(message, sock) {
    try {
      // Parse command
      const { content, remoteJid, sender, isGroup } = message;

      if (!content.startsWith(this.prefix)) {
        return false;
      }

      const args = content.slice(this.prefix.length).trim().split(/\s+/);
      const commandName = args.shift();

      if (!commandName) return false;

      // Get command
      const command = this.getCommand(commandName);
      if (!command) {
        return false; // Command tidak ditemukan
      }

      // Validasi izin
      if (command.adminOnly && sender !== this.ownerPhone) {
        // Simplified admin check - just check custom admin list
        const phoneNumber = sender.split("@")[0];
        const isCustomAdmin = modData.isCustomAdmin(remoteJid, phoneNumber);
        
        if (!isCustomAdmin) {
          await sock.sendMessage(remoteJid, {
            text: "❌ Perintah ini hanya untuk admin",
          });
          return true;
        }
      }

      if (command.ownerOnly && sender !== this.ownerPhone) {
        await sock.sendMessage(remoteJid, {
          text: "❌ Perintah ini hanya untuk owner",
        });
        return true;
      }

      // Execute
      await command.execute({
        sock,
        message,
        args,
        prefix: this.prefix,
      });

      return true;
    } catch (error) {
      console.error(chalk.redBright("Error executing command:"), error);
      return false;
    }
  }

  /**
   * Get all commands info (untuk help command)
   */
  getAllCommands() {
    const commands = [];
    for (const [name, cmd] of this.commands) {
      commands.push({
        name: cmd.name,
        category: cmd.category || "other",
        description: cmd.description || "No description",
        usage: cmd.usage || `${this.prefix}${cmd.name}`,
        aliases: cmd.aliases || [],
        adminOnly: cmd.adminOnly || false,
        ownerOnly: cmd.ownerOnly || false,
      });
    }
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get command info
   */
  getCommandInfo(commandName) {
    const command = this.getCommand(commandName);
    if (!command) return null;

    return {
      name: command.name,
      category: command.category || "other",
      description: command.description || "No description",
      usage: command.usage || `${this.prefix}${command.name}`,
      aliases: command.aliases || [],
      adminOnly: command.adminOnly || false,
      ownerOnly: command.ownerOnly || false,
    };
  }
}

export default CommandHandler;
