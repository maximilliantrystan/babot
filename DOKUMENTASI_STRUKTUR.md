# 📚 Dokumentasi Struktur & File

Dokumentasi lengkap tentang struktur folder dan fungsi setiap file script.

## 📖 Dokumentasi Utama

### 1. [FILE_STRUCTURE.md](./docs/FILE_STRUCTURE.md) - Struktur Folder Lengkap
Penjelasan detail tentang:
- Hierarki folder & file
- Fungsi setiap file
- Import/Export patterns
- Contoh penggunaan

### 2. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arsitektur & Design Patterns
Penjelasan tentang:
- Layered architecture
- Data flow
- Design patterns yang digunakan
- Dependency graph
- Scaling strategy
- Performance considerations

### 3. [API.md](./docs/API.md) - API Reference & Examples
Dokumentasi API dengan:
- Quick start
- Core API reference
- Services API
- Utils API
- Event handling
- Common patterns
- Error handling
- Advanced usage

---

## 🏗️ Struktur Folder Overview

```
src/
├── core/              ← WhatsApp connection
├── services/          ← Cache, Message, Logger
├── utils/             ← Utilities by category
│   ├── media.js       ← Media handling
│   ├── file.js        ← File operations
│   ├── json.js        ← JSON management
│   ├── date.js        ← Date utilities
│   ├── chat.js        ← Chat utilities
│   ├── helpers.js     ← Helper functions
│   └── index.js       ← Main export
├── config/            ← Configuration
└── release.js         ← NPM release script

docs/
├── FILE_STRUCTURE.md  ← This documentation
├── ARCHITECTURE.md    ← Architecture details
└── API.md             ← API reference
```

---

## 🎯 Kategori File

### Core (Koneksi WhatsApp)
- **connect.js** - WhatsApp connection manager

### Services (Business Logic)
- **cache.js** - Group metadata & profile caching
- **message.js** - Message serialization
- **logger.js** - Logging system (Winston)

### Utils (Utilities by Category)

#### Media
- Download media (image, video, audio, document, sticker)
- Convert audio format
- Upload temporary files

#### File Operations
- Setup session directory
- Delete/clear folders
- Create backups
- Docker detection

#### JSON Management
- Read/write JSON files
- Add/update/delete entries

#### Date & Time
- Format current date/time
- Calculate duration
- Get greeting/weekday
- Format remaining time

#### Chat & Messaging
- Send messages with mentions
- Reply to messages
- URL detection & extraction
- Image messaging

#### Helpers
- Console logging (dengan warna)
- String manipulation
- Random generation
- Buffer operations
- Message type detection
- Admin checking
- Contact name fetching

---

## 📝 Quick Reference

### Import dari Utils
```javascript
import { downloadMedia, log, getCurrentTime } from "./src/utils/index.js"
```

### Import dari Services
```javascript
import { getGroupMetadata } from "./src/services/cache.js"
import { logger } from "./src/services/logger.js"
```

### Menjalankan Bot
```bash
npm start
```

### Release ke NPM
```bash
npm run release "pesan commit"
```

---

## 📖 Untuk Detail Lengkap

- **Penjelasan setiap file** → [FILE_STRUCTURE.md](./docs/FILE_STRUCTURE.md)
- **Arsitektur & design** → [ARCHITECTURE.md](./docs/ARCHITECTURE.md)  
- **API & contoh code** → [API.md](./docs/API.md)

---

Generated: March 2, 2026
