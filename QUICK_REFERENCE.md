# 🚀 Quick Reference - Struktur & Fungsi File

## ⚡ Cheat Sheet - Cari File Sesuai Kebutuhan

### ❓ Saya ingin...

#### **Download media?**
→ `src/utils/media.js`
```javascript
import { downloadMedia, downloadQuotedMedia } from "./src/utils/media.js"
const file = await downloadMedia(message)
```

#### **Kirim pesan dengan mention?**
→ `src/utils/chat.js`
```javascript
import { sendMessageWithMention } from "./src/utils/chat.js"
await sendMessageWithMention(sock, jid, text, message, senderType)
```

#### **Reply pesan?**
→ `src/utils/chat.js`
```javascript
import { reply } from "./src/utils/chat.js"
await reply(m, "Balas pesan ini")
```

#### **Get metadata grup?**
→ `src/services/cache.js`
```javascript
import { getGroupMetadata } from "./src/services/cache.js"
const meta = await getGroupMetadata(sock, groupId)
```

#### **Logging dengan warna?**
→ `src/utils/helpers.js`
```javascript
import { log, success, danger } from "./src/utils/helpers.js"
success("Bot", "Connected!")
danger("Error", "Failed to connect")
```

#### **Format waktu?**
→ `src/utils/date.js`
```javascript
import { getCurrentTime, getGreeting } from "./src/utils/date.js"
console.log(getCurrentTime())    // "14:30:45"
console.log(getGreeting())       // "Siang"
```

#### **Simpan/baca file JSON?**
→ `src/utils/json.js`
```javascript
import { readJsonFile, addJsonEntry } from "./src/utils/json.js"
const data = await readJsonFile("file.json")
await addJsonEntry("file.json", entry, key)
```

#### **Setup session atau backup?**
→ `src/utils/file.js`
```javascript
import { setupSessionDirectory, createBackup } from "./src/utils/file.js"
setupSessionDirectory("session")
const backup = await createBackup()
```

#### **Deteksi tipe pesan?**
→ `src/utils/helpers.js`
```javascript
import { getMessageType, isQuotedMessage } from "./src/utils/helpers.js"
const type = getMessageType("imageMessage")  // "image"
const quoted = isQuotedMessage(message)
```

---

## 📂 Quick Folder Reference

| Kebutuhan | Folder | File |
|-----------|--------|------|
| Connect WhatsApp | `src/core/` | `connect.js` |
| Cache & sessions | `src/services/` | `cache.js` |
| Serialize pesan | `src/services/` | `message.js` |
| Logging Winston | `src/services/` | `logger.js` |
| Download media | `src/utils/` | `media.js` |
| File operations | `src/utils/` | `file.js` |
| JSON management | `src/utils/` | `json.js` |
| Date/time | `src/utils/` | `date.js` |
| Send message | `src/utils/` | `chat.js` |
| Helpers & logging | `src/utils/` | `helpers.js` |
| Config defaults | `src/config/` | `index.js` |

---

## 🎯 Import Patterns

### Pattern 1: Import dari Utils Index (Recommended)
```javascript
import { downloadMedia, log, getCurrentTime } from "./src/utils/index.js"
```

### Pattern 2: Import dari Specific Module
```javascript
import { downloadMedia } from "./src/utils/media.js"
import { log } from "./src/utils/helpers.js"
```

### Pattern 3: Import dari Services
```javascript
import { getGroupMetadata } from "./src/services/cache.js"
import { logger } from "./src/services/logger.js"
```

### Pattern 4: Import dari Core
```javascript
import connectToWhatsApp from "./src/core/connect.js"
```

---

## 💡 Common Use Cases

### 1. Menangani incoming message
```javascript
import { reply, log } from "./src/utils/index.js"
import serializeMessage from "./src/services/message.js"

events.on("message", async (msg) => {
  log("Bot", `Pesan dari ${msg.pushName}: ${msg.content}`)
  
  if (msg.content === "halo") {
    await reply(msg.m, "Halo juga!")
  }
})
```

### 2. Download & process media
```javascript
import { downloadMedia } from "./src/utils/media.js"

events.on("message", async (msg) => {
  if (msg.type === "image") {
    const filePath = await downloadMedia(msg.message)
    console.log("Gambar tersimpan di:", filePath)
  }
})
```

### 3. Check admin & execute command
```javascript
import { checkIfAdmin, reply } from "./src/utils/index.js"

events.on("message", async (msg) => {
  const isAdmin = await checkIfAdmin(sock, msg.remoteJid, msg.sender)
  
  if (msg.content === "kick" && isAdmin) {
    // Execute kick command
  }
})
```

### 4. Send message with mention
```javascript
import { sendMessageWithMention } from "./src/utils/chat.js"

await sendMessageWithMention(
  sock,
  groupId,
  "Halo @1234567890 dan @9876543210",
  message,
  "user"
)
```

### 5. Work with group data
```javascript
import { getGroupMetadata, updateParticipant } from "./src/services/cache.js"

const meta = await getGroupMetadata(sock, groupId)
console.log(`Anggota: ${meta.participants.length}`)

await updateParticipant(sock, groupId, ["1234567890"], "add")
```

### 6. Format & display time
```javascript
import { getCurrentTime, formatDuration, getGreeting } from "./src/utils/date.js"

const greeting = getGreeting()  // "Pagi", "Siang", "Sore", "Malam"
const time = getCurrentTime()   // "14:30:45"
const duration = formatDuration(lastActivity)  // "2 jam yang lalu"
```

---

## 🔧 Configuration

### Get Config
```javascript
import config from "./src/config/index.js"

const prefix = config.bot.prefix
const sessionFolder = config.session.folder
const autoRead = config.bot.autoread
```

### Override Config (via env vars)
```bash
export SESSION_FOLDER=custom_session
export BOT_PREFIX=!
export AUTO_READ=false
npm start
```

---

## 📚 Documentation Links

- **Overview**: [DOKUMENTASI_STRUKTUR.md](./DOKUMENTASI_STRUKTUR.md)
- **Full API**: [docs/API.md](./docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **File Details**: [docs/FILE_STRUCTURE.md](./docs/FILE_STRUCTURE.md)

---

## ✅ Verification Commands

```bash
# Check syntax semua JS files
node --check src/core/connect.js
node --check src/services/cache.js
node --check src/utils/index.js

# Run bot
npm start

# Release to npm
npm run release "commit message"
```

---

## 🎓 Learning Order

1. **20 mins**: Baca [DOKUMENTASI_STRUKTUR.md](./DOKUMENTASI_STRUKTUR.md)
2. **30 mins**: Baca section "Common Use Cases" di file ini
3. **1 hour**: Explore [docs/API.md](./docs/API.md) sesuai kebutuhan
4. **2 hours**: Customize & build feature
5. **As needed**: Refer ke [docs/FILE_STRUCTURE.md](./docs/FILE_STRUCTURE.md) untuk detail

---

Generated: March 2, 2026
