# 🏗️ Arsitektur & Design Patterns

## Arsitektur Overview

Project menggunakan **Modular Architecture** dengan pemisahan concerns yang jelas:

```
┌─ Core Layer ────────────────────┐
│  src/core/                      │
│  - WhatsApp connection          │
│  - Event handling               │
└─────────────────────────────────┘
         ↓
┌─ Services Layer ────────────────┐
│  src/services/                  │
│  - Message serialization        │
│  - Cache management             │
│  - Logging                      │
└─────────────────────────────────┘
         ↓
┌─ Utils Layer ───────────────────┐
│  src/utils/                     │
│  - Helpers & utilities          │
│  - File operations              │
│  - Chat utilities               │
└─────────────────────────────────┘
         ↓
┌─ Config Layer ──────────────────┐
│  src/config/                    │
│  - Default configuration        │
│  - Validation rules             │
└─────────────────────────────────┘
```

## Layer Descriptions

### 1️⃣ Core Layer (`src/core/`)
**Inti koneksi WhatsApp**
- Menangani koneksi ke Baileys
- Event emitter untuk message flow
- QR Code & Pairing management
- Auto-reconnect logic

### 2️⃣ Services Layer (`src/services/`)
**Business logic & domain-specific operations**
- **Cache Service**: Group metadata, profile pictures, sessions
- **Message Service**: Standardisasi format pesan
- **Logger Service**: Winston-based logging

### 3️⃣ Utils Layer (`src/utils/`)
**Utility functions & helpers**
- Media operations (download, convert)
- File operations (backup, cleanup)
- Chat utilities (mentions, replies)
- Date & time formatting
- Helper functions (logging, arrays, etc)

### 4️⃣ Config Layer (`src/config/`)
**Application configuration**
- Default settings
- Validation rules
- Environment variables

---

## Data Flow

### Message Incoming Flow

```
WhatsApp (Baileys)
       ↓
events.on("messages.upsert")
       ↓
serializeMessage() [Services]
       ↓
Standard Message Object
       ↓
eventBus.emit("message", result)
       ↓
Application Handler
```

### Message Output Flow

```
Application
       ↓
reply(m, text) [Chat Utils]
       ↓
sock.sendMessage()
       ↓
WhatsApp (Baileys)
```

---

## Design Patterns Used

### 1. **Module Pattern**
Setiap file adalah module dengan namespace terbatas
```javascript
// media.js
export { downloadMedia, downloadQuotedMedia, ... }

// index.js
export { ... } from "./media.js"
```

### 2. **Service Locator Pattern**
Utils di-export melalui index.js untuk mudah diakses
```javascript
import { downloadMedia, log, getCurrentTime } from "./src/utils/index.js"
```

### 3. **Event-Driven Architecture**
EventEmitter untuk komunikasi antar komponen
```javascript
eventBus.on("message", handler)
eventBus.on("group-update", handler)
```

### 4. **Singleton Pattern**
Cache & Logger sebagai singleton instances
```javascript
const sessions = new Map()  // Shared across app
const logger = createLogger()  // Single instance
```

### 5. **Factory Pattern**
createBackup(), createLogger() - functions yang membuat instances

---

## Import Strategy

### ✅ Recommended
```javascript
// Dari utils index (barrel export)
import { downloadMedia, log } from "./src/utils/index.js"

// Dari specific module (jika butuh langsung)
import { downloadMedia } from "./src/utils/media.js"

// Dari services
import { getGroupMetadata } from "./src/services/cache.js"
```

### ❌ Avoid
```javascript
// Jangan: circular imports
// Jangan: import dari internal paths yang tidak diekspor
// Jangan: mixing relative & absolute paths
```

---

## Best Practices

### 1. **Separation of Concerns**
- Functional code → utils/
- Business logic → services/
- Configuration → config/
- Connection → core/

### 2. **DRY (Don't Repeat Yourself)**
- Reusable functions di utils/
- Shared state di services/
- Centralized config di config/

### 3. **Error Handling**
```javascript
try {
  const result = await someAsyncFunction()
  return result
} catch (error) {
  console.error("Clear error message:", error)
  return null // atau throw
}
```

### 4. **Logging**
```javascript
// Untuk development
log(pushName, message)
success("Bot", "Connected successfully")

// Untuk tracking
logTracking(`module.js - function (${id})`)

// Untuk critical errors
danger("ERROR", message)
```

### 5. **Async Operations**
- Gunakan `async/await` bukan promises
- Handle errors dengan try-catch
- Validate input sebelum async call

---

## Dependency Graph

```
index.js
    ↓
base.js
    ├── src/core/connect.js
    │   ├── src/services/cache.js
    │   ├── src/services/message.js
    │   └── src/utils/index.js
    │       ├── src/utils/media.js
    │       ├── src/utils/file.js
    │       ├── src/utils/helpers.js
    │       ├── src/utils/chat.js
    │       ├── src/utils/json.js
    │       └── src/utils/date.js
    │
    ├── src/services/cache.js
    │   └── src/utils/helpers.js
    │
    └── src/services/message.js
        └── src/utils/helpers.js
```

---

## Scaling Strategy

### Menambah Fitur Baru

1. **Jika business logic**: Buat service baru di `src/services/`
2. **Jika utility function**: Buat/update file di `src/utils/`
3. **Jika akses WhatsApp**: Update `src/core/connect.js`
4. **Jika configuration**: Update `src/config/index.js`

### Menambah Handler

```javascript
// Di index.js atau handler file
events.on("message", async (msg) => {
  // Handle message
})

events.on("group-update", async (update) => {
  // Handle group update
})

events.on("call", async (calls) => {
  // Handle calls
})
```

---

## Performance Considerations

### 1. **Caching**
- Group metadata cached 60 menit
- Profile pictures cached 60 menit
- Clear old cache automatically

### 2. **Message Filtering**
- Filter pesan older than 30 seconds
- Skip append-type messages
- Ignore status broadcasts ketika tidak perlu

### 3. **Async Operations**
- Download media di background
- Batch JSON operations
- Use Promise.all() untuk parallel ops

---

## Testing Strategy

Untuk testing setiap layer:

### Unit Tests
- Test individual utils functions
- Mock socket & messages
- Test edge cases

### Integration Tests
- Test message flow end-to-end
- Test cache invalidation
- Test event emission

### E2E Tests
- Connect to real WhatsApp
- Send/receive actual messages
- Monitor logs

---

Generated: March 2, 2026
