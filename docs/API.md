# 📚 API Documentation

## Quick Start

### Installation & Setup

```bash
npm install
```

### Run Bot

```bash
npm start
```

### Release to NPM

```bash
npm run release "message"
```

---

## Core API

### `connectToWhatsApp(options)`

Menghubungkan bot ke WhatsApp.

**Options:**
```javascript
{
  folder: "session",           // Folder penyimpanan session
  phoneNumber: null,           // Nomor bot (untuk pairing)
  type_connection: "qr",       // "qr" atau "pairing"
  autoread: true               // Auto-read messages
}
```

**Returns:**
```javascript
{
  sock: WhatsAppSocket,        // WebSocket untuk WhatsApp
  events: EventEmitter         // Event bus
}
```

**Example:**
```javascript
const { sock, events } = await connectToWhatsApp({
  folder: "session",
  type_connection: "qr",
  autoread: true
})

events.on("connected", () => console.log("✅ Connected!"))
events.on("message", (msg) => console.log("📨", msg.content))
```

---

## Services API

### Cache Service

#### `getGroupMetadata(sock, jid)`
Ambil metadata grup dengan cache.

```javascript
import { getGroupMetadata } from "./src/services/cache.js"

const metadata = await getGroupMetadata(sock, "123456789-1234567890@g.us")
// Returns: { id, subject, participants, [...] }
```

#### `getProfilePictureUrl(sock, sender)`
Ambil URL foto profil.

```javascript
const url = await getProfilePictureUrl(sock, "1234567890@s.whatsapp.net")
// Returns: "https://..."
```

#### `updateParticipant(sock, jid, participants, action)`
Update peserta grup dalam cache.

```javascript
await updateParticipant(
  sock, 
  "123456789-1234567890@g.us",
  ["1234567890", "9876543210"],
  "add"  // atau remove, promote, demote
)
```

---

### Message Service

#### `serializeMessage(m, sock)`
Standarisasi format pesan.

**Input:** Raw message dari Baileys
**Output:**
```javascript
{
  id: "3EB042...",
  timestamp: 1704067200,
  sender: "1234567890@s.whatsapp.net",
  pushName: "John Doe",
  isGroup: false,
  fromMe: false,
  remoteJid: "1234567890@s.whatsapp.net",
  type: "text",                    // media type
  content: "Hello world",
  command: "hello",               // first word
  isQuoted: false,
  quotedMessage: null,
  mentionedJid: [],
  isBot: false,
  isForwarded: false,
  senderType: "user",
  m: { sock, message, ... }
}
```

---

### Logger Service

#### `logCustom(level, message, filename)`
Log ke file dengan custom level.

```javascript
import { logCustom } from "./src/services/logger.js"

logCustom("info", "Bot connected")
logCustom("error", "Connection failed", "bot-error.log")
```

**Levels:** info, warn, error, debug

---

## Utils API

### Media Utils

```javascript
import { downloadMedia, downloadQuotedMedia } from "./src/utils/media.js"

// Download media dari pesan
const filePath = await downloadMedia(message, "./media")
// Returns: "/path/to/media/image_1704067200.jpg"

// Download media dari quoted message
const filePath = await downloadQuotedMedia(message, "./media")
// Returns: "/path/to/media/video_1704067200.mp4"

// Konversi audio ke M4A
const outputPath = await convertAudioToCompatibleFormat(inputPath)
```

### File Utils

```javascript
import { setupSessionDirectory, createBackup } from "./src/utils/file.js"

// Setup session directory dengan permissions
setupSessionDirectory("./session")

// Buat backup project
const backup = await createBackup()
// Returns: { path, time, size }
// Example: { path: "...", time: "0.234 seconds", size: "45.67 MB" }
```

### JSON Utils

```javascript
import { readJsonFile, addJsonEntry } from "./src/utils/json.js"

// Baca JSON file
const data = await readJsonFile("./data.json")

// Tambah entry
await addJsonEntry("./data.json", { name: "John" }, "user_1")

// Update entry
await updateJsonEntry("./data.json", "user_1", { age: 25 })

// Hapus entry
await deleteJsonEntry("./data.json", "user_1")
```

### Date Utils

```javascript
import { 
  getCurrentTime, 
  formatDuration, 
  getGreeting 
} from "./src/utils/date.js"

getCurrentTime()           // "14:30:45" (WIB)
getCurrentDate()           // "2 Maret 2026"
formatDuration(lastChat)   // "2 jam yang lalu"
selisihHari(endDate)       // "3 hari mendatang"
getHari()                  // "Senin"
getGreeting()              // "Siang"
```

### Chat Utils

```javascript
import { 
  sendMessageWithMention,
  reply,
  extractLink 
} from "./src/utils/chat.js"

// Kirim dengan mention
await sendMessageWithMention(
  sock, 
  remoteJid, 
  "Halo @1234567890",
  message,
  "user"
)

// Reply pesan
await reply(m, "Balas untuk pesan ini")

// Extract link
const link = extractLink("Klik link ini: https://example.com")
// Returns: "https://example.com"
```

### Helper Utils

```javascript
import { 
  log, 
  success, 
  danger, 
  random,
  toText 
} from "./src/utils/helpers.js"

log("Bot", "Starting bot...")
success("Connected", "Bot connected successfully")
danger("Error", "Connection failed")

random(12)                 // "aB3cDeFgHi0"
toText({ name: "John" })   // '{"name":"John"}'

// Get message type
getMessageType("imageMessage")  // "image"
getSenderType("1234567890@s.whatsapp.net")  // "user"

// Check if admin
const isAdmin = await checkIfAdmin(sock, groupId, userId)
```

---

## Event Handling

### Event Types

```javascript
const { sock, events } = await connectToWhatsApp()

// Koneksi berhasil
events.on("connected", (sock) => {
  console.log("✅ Bot terhubung!")
})

// Koneksi terputus
events.on("disconnected", (reason) => {
  console.log("❌ Koneksi terputus:", reason)
})

// Pesan masuk
events.on("message", async (msg) => {
  console.log(`📨 dari ${msg.sender}: ${msg.content}`)
  
  if (msg.content === "halo") {
    await reply(msg.m, "Halo juga!")
  }
})

// Update grup (member join/leave, etc)
events.on("group-update", (info) => {
  console.log(`📢 Grup ${info.id}: ${info.action}`)
})

// Panggilan masuk
events.on("call", (calls) => {
  console.log("☎️ Incoming call:", calls)
})
```

---

## Common Patterns

### Respond to Commands

```javascript
events.on("message", async (msg) => {
  const cmd = msg.content.split(" ")[0].toLowerCase()
  
  switch(cmd) {
    case "ping":
      await reply(msg.m, "Pong!")
      break
    case "time":
      const time = getCurrentTime()
      await reply(msg.m, `Waktu: ${time}`)
      break
    case "random":
      const num = Math.floor(Math.random() * 100)
      await reply(msg.m, `Random: ${num}`)
      break
  }
})
```

### Handle Group Messages

```javascript
events.on("message", async (msg) => {
  if (!msg.isGroup) return  // Skip if not from group
  
  // Check if sender is admin
  const isAdmin = await checkIfAdmin(sock, msg.remoteJid, msg.sender)
  
  if (!isAdmin && msg.content.includes("delete")) {
    await reply(msg.m, "Hanya admin yang bisa hapus")
    return
  }
})
```

### Download Media

```javascript
events.on("message", async (msg) => {
  if (msg.type === "image") {
    const filePath = await downloadMedia(msg.message, "./downloads")
    console.log(`Gambar tersimpan di: ${filePath}`)
  }
})
```

### Mention Users

```javascript
events.on("message", async (msg) => {
  const text = `Halo @${msg.sender.split("@")[0]}, Apa kabar?`
  
  await sendMessageWithMention(
    sock,
    msg.remoteJid,
    text,
    msg.message,
    msg.senderType
  )
})
```

---

## Error Handling

### Safe Message Reply

```javascript
events.on("message", async (msg) => {
  try {
    // Process message
    if (msg.content === "error") {
      throw new Error("Something went wrong")
    }
    
    await reply(msg.m, "Success!")
  } catch (error) {
    danger("Error", error.message)
    await reply(msg.m, "⚠️ Terjadi error!")
  }
})
```

### Safe Async Operations

```javascript
async function processMedia(msg) {
  try {
    const filePath = await downloadMedia(msg.message)
    console.log(`File: ${filePath}`)
    return filePath
  } catch (error) {
    console.error("Failed to download:", error)
    return null
  }
}
```

---

## Configuration

### Environment Variables

```bash
# .env
SESSION_FOLDER=session
CONNECTION_TYPE=qr
PHONE_NUMBER=628xxxxxxxxx
AUTO_READ=true
BOT_PREFIX=.
LOG_LEVEL=info
```

### Using Config

```javascript
import config from "./src/config/index.js"

const sessionFolder = config.session.folder
const prefix = config.bot.prefix
const logLevel = config.logging.level
```

---

## Advanced Usage

### Custom Event Emitter

```javascript
const EventEmitter = require("events")
const customEvents = new EventEmitter()

// Emit custom event
customEvents.emit("custom-event", data)

// Listen to custom event
customEvents.on("custom-event", (data) => {
  console.log("Custom event:", data)
})
```

### Batch Operations

```javascript
const messages = ["Halo 1", "Halo 2", "Halo 3"]

// Kirim semua sekaligus
await Promise.all(
  messages.map(msg => 
    sock.sendMessage(remoteJid, { text: msg })
  )
)
```

### Rate Limiting

```javascript
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

for (const msg of messages) {
  await sock.sendMessage(remoteJid, { text: msg })
  await sleep(1000)  // Wait 1 second between messages
}
```

---

## Troubleshooting

### Bot tidak connect

1. Pastikan nomor valid
2. Cek mode connection (qr vs pairing)
3. Lihat logs: `tail -f logs/bot-activity-*.log`

### Pesan tidak masuk

1. Cek event listener
2. Verify message filter (old messages filtered)
3. Check socket connection status

### Media tidak download

1. Verify file path exists
2. Check disk space
3. Verify Baileys version

---

Generated: March 2, 2026
