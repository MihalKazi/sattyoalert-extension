# 🚨 SattyoAlert Browser Extension

A powerful, lightweight, and intelligent browser extension designed to work seamlessly with the **SattyoAlert Fact-Checking Platform**.

🔗 **Live Platform:** [https://sattyo-alert-hackathon.vercel.app/](https://sattyo-alert-hackathon.vercel.app/)

Enhance your browsing experience by instantly verifying news, detecting misinformation, and accessing fast fact-checks—directly from your browser.

---

## ✨ Key Features

### 🔍 Instant Fact Verification

Verify any text, headline, or news snippet instantly through the extension popup.

### ⚡ On-Page Smart Detection

Select any text → Right-click → **“Check with SattyoAlert”**.
Instantly sends the selected text for fact-checking.

### 🧠 Intelligent Background Service

Runs smoothly with minimal resource usage. Manages API calls, context menus, and automation.

### 🎨 Clean & Responsive UI

A simple, stylish popup interface designed for speed and clarity.

### 🔒 Safe & Secure

All verification requests are securely sent to the SattyoAlert backend.

---

## 📁 Project Structure

```
sattyoalert-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── styles.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🛠️ Installation (Developer Mode)

### 🧩 Chrome / Edge

1. Clone the repository:

   ```bash
   git clone https://github.com/MihalKazi/sattyoalert-extension.git
   ```
2. Open **chrome://extensions/**
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the project folder
6. The SattyoAlert icon will appear in your browser bar

### 🦊 Firefox (Optional)

1. Open: **about:debugging > This Firefox**
2. Click **Load Temporary Add-on**
3. Choose `manifest.json`

---

## 🧭 How It Works

### 🖱️ Popup Mode

* Click the extension icon
* Paste or type any claim/news
* Send to SattyoAlert fact-checker
* Get instant verification results

### 📄 On-Page Fact-Check

* Select text on any site
* Right-click → **Check with SattyoAlert**
* Fact-check result appears via the extension

### 🔧 Background Logic

The `background.js` handles:

* API management
* Context menu setup
* Communication between popup & content scripts

---

## 🌐 API Integration

The extension communicates with the SattyoAlert backend:

**Base API:**
`https://sattyo-alert-hackathon.vercel.app/api/...`

Supports:

* POST/GET requests
* JSON formatted responses

Customize the API routes inside `popup.js` or `background.js` depending on usage.

---

## 🚀 Development Guide

### Modify UI

* `popup.html` → structure
* `styles.css` → design

### Script Logic

* `popup.js` → handles interactions
* `content.js` → reads selected text from pages
* `background.js` → manages extension lifecycle

Reload extension after any changes:

* Go to **chrome://extensions** → **Reload**

---

## 📝 Future Enhancements

* [ ] Dark mode UI
* [ ] Floating fact-check button on webpages
* [ ] History of verified claims
* [ ] AI-powered auto-scan for misinformation
* [ ] Cross-browser sync for settings

---

## 🤝 Contributing

Pull requests are welcome!
Improve features, UI, or add new ideas to boost the SattyoAlert ecosystem.

---

## 📄 License

This project is licensed under the **MIT License**.

---

### ❤️ Made for the SattyoAlert Hackathon

Modern browser tools for a safer, misinformation-free internet.
