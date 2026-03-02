# 📁 Struktur Folder & Dokumentasi File

## Hierarki Folder

```
babot/
│
├── 📄 index.js              # Entry point aplikasi
├── 📄 base.js               # Export main functions (legacy support)
├── 📄 package.json          # Project metadata & dependencies
├── 📄 README.md             # Project documentation
│
├── 📁 src/                  # Source code
│   ├── 📁 core/
│   │   └── connect.js       # WhatsApp connection manager
│   │
│   ├── 📁 services/
│   │   ├── cache.js         # Group & profile cache management
│   │   ├── message.js       # Message serializer (format standardisasi)
│   │   └── logger.js        # Logging service (Winston)
│   │
│   ├── 📁 utils/
│   │   ├── index.js         # Main export untuk semua utilities
│   │   ├── media.js         # Download & manage media
│   │   ├── file.js          # File & folder operations
│   │   ├── json.js          # JSON file management
│   │   ├── date.js          # Date & time utilities
│   │   ├── chat.js          # Chat & messaging utilities
│   │   └── helpers.js       # Helper functions & logging
│   │
│   ├── 📁 config/
│   │   └── index.js         # Default configuration
│   │
│   └── release.js           # NPM release script
│
├── 📁 docs/                 # Documentation
│   ├── ARCHITECTURE.md      # Architecture overview
│   ├── FILE_STRUCTURE.md    # This file
│   └── API.md               # API documentation
│
└── 📁 logs/                 # Log files (daily rotation)
```

## Penjelasan Setiap File

### 🔵 Root Files

| File | Fungsi |
|------|--------|
| `index.js` | Entry point utama - menjalankan bot |
| `base.js` | Mengexport fungsi utama (backward compatibility) |
| `package.json` | Metadata & dependencies project |
| `README.md` | Dokumentasi project |

---

### 📁 src/core/
**Inti koneksi WhatsApp**

#### `connect.js`
- **Fungsi**: Menghubungkan bot ke WhatsApp via Baileys
- **Export**: `connectToWhatsApp(options)`
- **Fitur**:
  - QR Code scanning
  - Pairing mode
  - Event handling (pesan, grup, koneksi)
  - Auto-reconnect
- **Options**:
  - `folder`: Folder session (default: "session")
  - `phoneNumber`: Nomor bot (untuk pairing)
  - `type_connection`: "qr" atau "pairing"
  - `autoread`: Auto-read messages (default: true)

---

### 📁 src/services/
**Business logic & services**

#### `cache.js`
- **Fungsi**: Manajemen cache data
- **Export**:
  - `getGroupMetadata(sock, jid)` - Ambil metadata grup
  - `getProfilePictureUrl(sock, sender)` - Ambil foto profil
  - `clearGroupCache(jid)` - Hapus cache grup
  - `updateParticipant(sock, jid, participants, action)` - Update peserta
  - `sessions` - Map untuk menyimpan session socket

#### `message.js` 
- **Fungsi**: Standardisasi format pesan dari Baileys
- **Export**: `serializeMessage(m, sock)`
- **Output**:
  ```javascript
  {
    id,              // Message ID
    timestamp,       // Waktu pesan
    sender,          // JID pengirim
    pushName,        // Nama display pengirim
    isGroup,         // Apakah dari grup
    fromMe,          // Apakah dari bot sendiri
    remoteJid,       // JID tujuan
    type,            // Tipe pesan (text, image, sticker, dll)
    content,         // Isi pesan
    message,         // Raw message object
    command,         // Kata pertama (untuk command)
    isQuoted,        // Apakah quoted message
    quotedMessage,   // Info pesan yang dikutip
    mentionedJid,    // Daftar mention
    isBot,           // Apakah dari bot lain
    isForwarded,     // Apakah forwarded
    senderType,      // "user", "lid", atau "group"
    m: { ... }       // Raw meta info
  }
  ```

#### `logger.js`
- **Fungsi**: Logging system menggunakan Winston
- **Export**:
  - `logger` - Logger instance utama
  - `logCustom(level, message, filename)` - Custom log ke file

---

### 📁 src/utils/
**Utility functions - Service layers**

#### `index.js`
- **Fungsi**: Main export untuk semua utilities
- **Mengexport dari**: media, file, json, date, chat, helpers

#### `media.js`
- **Fungsi**: Media management
- **Export**:
  - `downloadMedia(message, folderPath)` - Download media dari pesan
  - `downloadQuotedMedia(message, folderPath)` - Download media quoted
  - `convertAudioToCompatibleFormat(path)` - Konversi audio
  - `forceConvertToM4a(object)` - Paksa konversi ke M4A
  - `clearDirectory(dirPath)` - Bersihkan folder
  - `uploadTmpFile(path, waktu)` - Upload ke server temporary
  - `deleteMedia(fileName)` - Hapus file media

#### `file.js`
- **Fungsi**: File & folder operations
- **Export**:
  - `setupSessionDirectory(sessionDir)` - Setup direktori session
  - `deleteFolderRecursive(folderPath)` - Hapus folder & isinya
  - `clearFolder(folderPath)` - Kosongkan folder
  - `createBackup()` - Buat backup project
  - `isDocker()` - Deteksi Docker environment

#### `json.js`
- **Fungsi**: JSON file management
- **Export**:
  - `readJsonFile(filePath)` - Baca file JSON
  - `addJsonEntry(filePath, entry, key)` - Tambah entry
  - `updateJsonEntry(filePath, id, data)` - Update entry
  - `deleteJsonEntry(filePath, key)` - Hapus entry

#### `date.js`
- **Fungsi**: Date & time utilities
- **Export**:
  - `getCurrentTime()` - Waktu saat ini (HH:MM:SS)
  - `getCurrentDate()` - Tanggal saat ini (DD Bulan YYYY)
  - `formatDuration(lastChat)` - Format durasi (semalam, 2 hari lalu, dll)
  - `formatRemainingTime(seconds)` - Format sisa waktu
  - `selisihHari(endDate)` - Hitung selisih hari
  - `getHari()` - Nama hari (Senin, Selasa, dll)
  - `getGreeting()` - Sapaan (Pagi, Siang, Sore, Malam)
  - `sleep(ms)` - Promise delay

#### `chat.js`
- **Fungsi**: Chat & messaging utilities
- **Export**:
  - `sendMessageWithMention(...)` - Kirim pesan dengan @mention
  - `reply(m, text)` - Reply pesan
  - `isURL(str)` - Deteksi URL
  - `isUrlValid(str)` - Validasi URL dengan regex
  - `extractLink(text)` - Extract link dari text

#### `helpers.js`
- **Fungsi**: Helper functions & utilities
- **Export**:
  - `log()`, `warning()`, `danger()`, `success()` - Console logging dengan warna
  - `removeSpace(str)` - Hapus spasi tertentu
  - `toText(input)` - Convert ke text
  - `random(length)` - Generate random string
  - `pickRandom(array)` - Pilih random dari array
  - `getBuffer(url)` - Download buffer dari URL
  - `fetchJson(url)` - Fetch JSON dari URL
  - `style(text, styles)` - Apply text style
  - `getMessageType(rawType)` - Identifikasi tipe pesan
  - `isQuotedMessage(message)` - Deteksi quoted message
  - `getSenderType(sender)` - Identifikasi tipe sender
  - `getName(sock, jid)` - Ambil nama contact
  - `checkIfAdmin(sock, jid, sender)` - Cek apakah admin

---

### 📁 src/config/
**Konfigurasi default**

#### `index.js`
- **Fungsi**: Default configuration bot
- **Contents**:
  ```javascript
  {
    session: { folder, type, phoneNumber },
    bot: { autoread, prefix },
    logging: { level, directory },
    cache: { ttl },
    validations: [ ... ]
  }
  ```
- **Usage**: `import config from './src/config/index.js'`

---

### 📁 src/
#### `release.js`
- **Fungsi**: Script untuk publish ke npm
- **Usage**: `npm run release "pesan commit"`
- **Proses**:
  1. Commit changes
  2. Auto-bump versi (patch)
  3. Push ke GitHub + tags
  4. Publish ke npm

---

### 📁 docs/
**Dokumentasi Project**

| File | Konten |
|------|--------|
| `ARCHITECTURE.md` | Penjelasan arsitektur & design patterns |
| `FILE_STRUCTURE.md` | Dokumentasi struktur file (file ini) |
| `API.md` | API documentation & examples |

---

### 📁 logs/
- **Fungsi**: Menyimpan log files
- **Format**: `bot-activity-YYYY-MM-DD.log`
- **Retention**: 14 hari otomatis dihapus

---

## Contoh Import

### Dari file utama
```javascript
import { connectToWhatsApp, sessions, serializeMessage } from './base.js';
```

### Dari utils
```javascript
import { 
  downloadMedia, 
  log, 
  success, 
  getCurrentTime 
} from './src/utils/index.js';
```

### Specific module
```javascript
import { downloadMedia } from './src/utils/media.js';
import { log, success } from './src/utils/helpers.js';
```

### Services
```javascript
import { getGroupMetadata } from './src/services/cache.js';
import { logger } from './src/services/logger.js';
```

---

## Tips Pengembangan

1. **Menambah Utility Baru**
   - Buat file di `src/utils/` sesuai kategori
   - Export di `src/utils/index.js`
   - Tambahkan dokumentasi di section yang sesuai

2. **Menambah Service Baru**
   - Buat file di `src/services/`
   - Update import di file yang membutuhkan

3. **Menambah Config**
   - Update `src/config/index.js`
   - Dokumentasikan di `docs/API.md`

4. **Logging**
   - Gunakan helper functions: `log()`, `success()`, `danger()`
   - Atau gunakan logger: `import { logger } from './src/services/logger.js'`

---

Generated: March 2, 2026
