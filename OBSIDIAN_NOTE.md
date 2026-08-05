# Device Simulator Chrome Extension - Documentation

**Tanggal:** Mon Aug 03 2026  
**Project Path:** `D:\Projects\mobile-simulator-extension`

---

## 🚀 Ringkasan Perubahan UI & Fitur Terbaru:

1. **Rebranded Name:**
   - Nama extension & header brand resmi diubah dari Mobile Simulator menjadi **`Device Simulator`**.

2. **Pembersihan Toolbar Header:**
   - Pilihan mode "Single / Compare Mode" di navbar atas **dihapuskan**.
   - Pengalaman pengguna disatukan: secara bawaan tampilan simulator sangat bersih, dan jika ingin menambah perangkat, pengguna cukup mengklik kartu **`+ Add Device`** yang ada di sebelah kanan paling ujung jajaran perangkat.

3. **Default Sync State:**
   - Tombol **Sync** pada toolbar secara default diatur dalam keadaan **`OFF`** (`Sync: OFF`).

4. **In-Place Device Switcher & Drag-to-Reorder:**
   - Setiap perangkat memiliki **Dropdown Select Switcher** di header untuk mengganti model secara instant.
   - Setiap perangkat memiliki handle `⋮⋮` yang dapat diseret (*drag & drop*) ke kiri/kanan untuk mengatur ulang urutan posisi perangkat.

---

## 📂 Struktur Project Extension:
- **Manifest Version:** V3 (`Device Simulator`)
- **Background Service Worker:** `background/background.js` (Hapus `x-frame-options` header)
- **Content Script:** `content/sync.js` (Scroll + Click navigation sync)
- **Simulator Page:** `simulator/simulator.html`, `simulator/simulator.css`, `simulator/simulator.js`
- **Popup Control Panel:** `popup/popup.html`, `popup/popup.css`, `popup/popup.js`
