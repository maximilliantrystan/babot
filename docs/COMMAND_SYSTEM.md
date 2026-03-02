# 🤖 Command System Guide

## 📋 Daftar Command yang Tersedia

| Command | Aliases | Desc | Admin | Owner |
|---------|---------|------|-------|-------|
| `ping` | pong | Test response time | ❌ | ❌ |
| `time` | jam, tanggal | Tampilkan waktu sekarang | ❌ | ❌ |
| `status` | info, botinfo | Tampilkan status bot | ❌ | ❌ |
| `echo` | say, repeat | Repeat text | ❌ | ❌ |
| `help` | h, ? | Daftar command | ❌ | ❌ |

---

## 🚀 Cara Menggunakan Command System

### 1️⃣ Setup di index.js

Tambahkan code ini di `index.js` setelah `connectToWhatsApp`:

```javascript
import CommandHandler from "./src/commands/handler.js";

const { sock, events } = await connectToWhatsApp({
  folder: "session",
  type_connection: "pairing",
  phoneNumber: process.env.PHONE_NUMBER || "628xxxxxxxxx",
  autoread: true,
});

// ========== COMMAND SYSTEM ==========
const commandHandler = new CommandHandler({
  prefix: ".",
  ownerPhone: process.env.OWNER_PHONE || "628xxxxxxxxx@s.whatsapp.net",
});

// Load commands
await commandHandler.loadCommands("./src/commands");

// Set handler reference untuk help command
const helpCmd = commandHandler.getCommand("help");
if (helpCmd) helpCmd._handler = commandHandler;

// Handle messages
events.on("message", async (msg) => {
  try {
    const executed = await commandHandler.execute(msg, sock);
    if (executed) console.log(`✅ CMD: ${msg.content}`);
  } catch (error) {
    console.error("Error:", error);
  }
});

console.log("🚀 Bot running with command system");
```

### 2️⃣ Buat Command Baru

**Langkah:**

1. Copy template:
   ```bash
   cp src/commands/TEMPLATE.js src/commands/mycommand.js
   ```

2. Edit file dengan struktur ini:
   ```javascript
   const myCommand = {
     name: "mycommand",
     description: "Deskripsi command",
     usage: ".mycommand [args]",
     aliases: ["mc", "my"],
     adminOnly: false,
     ownerOnly: false,

     async execute({ sock, message, args, prefix }) {
       const { remoteJid, sender, pushName, isGroup } = message;

       // Your logic here
       await sock.sendMessage(remoteJid, {
         text: "Hello from my command!",
       });
     },
   };

   export default myCommand;
   ```

3. Restart bot - command akan auto-load

### 3️⃣ Test Command

```
.ping              ← Test response
.time              ← Lihat waktu
.status            ← Lihat status bot
.help              ← Daftar semua command
.help ping         ← Detail command ping
.echo halo         ← Echo test
```

---

## 📝 Command Properties

| Property | Type | Required | Desc |
|----------|------|----------|------|
| `name` | string | ✅ | Nama command (lowercase) |
| `description` | string | ❌ | Deskripsi singkat |
| `usage` | string | ❌ | Cara menggunakan |
| `aliases` | string[] | ❌ | Nama alternatif |
| `adminOnly` | boolean | ❌ | Hanya untuk admin grup |
| `ownerOnly` | boolean | ❌ | Hanya untuk owner bot |
| `execute` | function | ✅ | Function yang dijalankan |

---

## 🎯 Execute Function Context

```javascript
async execute({ sock, message, args, prefix }) {
  // sock: WhatsApp socket
  // message: {
  //   id, timestamp, sender, pushName, isGroup, fromMe,
  //   remoteJid, type, content, command, isQuoted, etc
  // }
  // args: string[] - arguments setelah command
  // prefix: string - bot prefix ('.')
}
```

---

## 💡 Contoh Command Real

### 1. Simple Command
```javascript
const helloCommand = {
  name: "hello",
  description: "Greet user",
  aliases: ["hi"],
  async execute({ sock, message }) {
    await sock.sendMessage(message.remoteJid, {
      text: `👋 Hello ${message.pushName}!`,
    });
  },
};
export default helloCommand;
```

### 2. Command dengan Arguments
```javascript
const giveCommand = {
  name: "give",
  description: "Give something",
  usage: ".give <item> <amount>",
  async execute({ sock, message, args }) {
    const [item, amount] = args;
    if (!item || !amount) {
      await sock.sendMessage(message.remoteJid, {
        text: "❌ .give <item> <amount>",
      });
      return;
    }

    await sock.sendMessage(message.remoteJid, {
      text: `✅ Diberikan ${amount}x ${item}`,
    });
  },
};
export default giveCommand;
```

### 3. Admin Only Command
```javascript
const warnCommand = {
  name: "warn",
  description: "Warn member",
  adminOnly: true,
  async execute({ sock, message, args }) {
    const number = args[0];
    if (!number) {
      await sock.sendMessage(message.remoteJid, {
        text: "❌ .warn <nomor>",
      });
      return;
    }

    await sock.sendMessage(message.remoteJid, {
      text: `⚠️ ${number} sudah diwarn!`,
    });
  },
};
export default warnCommand;
```

### 4. Owner Only Command
```javascript
const restartCommand = {
  name: "restart",
  description: "Restart bot",
  ownerOnly: true,
  async execute({ sock, message }) {
    await sock.sendMessage(message.remoteJid, {
      text: "🔄 Bot restart...",
    });
    process.exit(0);
  },
};
export default restartCommand;
```

---

## 🔧 Command Handler Methods

```javascript
// Load commands
await commandHandler.loadCommands("./src/commands");

// Get command
const cmd = commandHandler.getCommand("ping");

// Get all commands
const allCmds = commandHandler.getAllCommands();

// Get command info
const info = commandHandler.getCommandInfo("ping");

// Execute command
const executed = await commandHandler.execute(message, sock);

// Register command
commandHandler.register(commandObject);

// Get alias
const name = commandHandler.aliases.get("pong");
```

---

## 🎓 Tips & Best Practices

✅ **Do:**
- Gunakan lowercase untuk name
- Tambahkan aliases untuk shortcut
- Validation arguments sebelum execute
- Send helpful messages jika argument salah
- Use emoji untuk clarity

❌ **Don't:**
- Jangan hardcode nomor/JID
- Jangan skip error handling
- Jangan edit built-in commands (extend malah)
- Jangan lupa export default

---

## 📊 File Structure

```
src/commands/
├── handler.js          ← Command handler (jangan edit)
├── TEMPLATE.js         ← Template untuk command baru
├── README.md           ← Dokumentasi
├── ping.js             ← Built-in command
├── time.js             ← Built-in command
├── status.js           ← Built-in command
├── echo.js             ← Built-in command
├── help.js             ← Built-in command
└── mycommand.js        ← Custom command
```

---

## 🚀 Next Steps

1. **Setup** command system di index.js
2. **Test** built-in commands: .ping, .time, .help
3. **Create** command baru: cp src/commands/TEMPLATE.js
4. **Customize** sesuai kebutuhan
5. **List command** di `.help`

---

Generated: March 2, 2026
