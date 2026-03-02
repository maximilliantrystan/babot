/**
 * Command Structure Template
 * 
 * Setiap command harus mengikuti struktur ini.
 * Copy file ini sebagai template untuk command baru.
 */

/**
 * @example
 * const myCommand = {
 *   name: "mycommand",
 *   description: "Deskripsi command",
 *   usage: ".mycommand [args]",
 *   aliases: ["mycmd", "mc"],
 *   adminOnly: false,
 *   ownerOnly: false,
 *   
 *   async execute({ sock, message, args, prefix }) {
 *     // Command logic here
 *   }
 * }
 * export default myCommand;
 */

export const commandTemplate = {
  // Nama command (required, lowercase)
  name: "template",

  // Deskripsi singkat
  description: "Template command",

  // Cara menggunakan
  usage: ".template [args]",

  // Alias alternatif
  aliases: ["tpl", "tmpl"],

  // Hanya admin grup yang bisa execute
  adminOnly: false,

  // Hanya owner bot yang bisa execute
  ownerOnly: false,

  /**
   * Execute command
   * @param {Object} context
   * @param {any} context.sock - WhatsApp socket
   * @param {Object} context.message - Serialized message
   * @param {string[]} context.args - Command arguments
   * @param {string} context.prefix - Bot prefix
   */
  async execute({ sock, message, args, prefix }) {
    const { remoteJid } = message;

    // Contoh: send message
    await sock.sendMessage(remoteJid, {
      text: "Template command works!",
    });
  },
};
