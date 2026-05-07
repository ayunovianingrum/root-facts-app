# Root Fact App 🥕✨

Root Fact App is an AI-powered Progressive Web App (PWA) that combines Computer Vision and Generative AI to create an interactive vegetable recognition experience directly in the browser.

Using the device camera, the app can detect vegetables in real time with TensorFlow.js, then generate unique and engaging fun facts using Transformers.js — all while supporting offline capability and installable app features.

---

## 🚀 Features

### 🥬 Real-Time Vegetable Detection

- Detects vegetables directly from the camera feed
- Uses a pre-trained TensorFlow.js model
- Live prediction with configurable FPS limit
- Adaptive AI backend:
  - WebGPU (if supported)
  - Automatic fallback to WebGL
- Memory optimization

### 🤖 AI-Generated Fun Facts

- Generates dynamic fun facts based on detected vegetables
- Powered by Transformers.js running locally in the browser
- Dynamic AI personas
- Copy-to-clipboard support

### 📱 Progressive Web App (PWA)

- Installable on desktop and mobile devices
- Offline-first experience using Workbox
- Precaching for core assets and AI models
- Works even without an internet connection

---

## 🧠 Technologies Used

| Technology       | Usage                         |
| ---------------- | ----------------------------- |
| TensorFlow.js    | Real-time vegetable detection |
| Transformers.js  | AI-generated fun facts        |
| Workbox          | PWA caching & offline support |
| WebGPU / WebGL   | Adaptive AI backend           |
| MediaStream API  | Camera access                 |
| Service Worker   | Offline capability            |
| Web App Manifest | Installable PWA               |

---

## ⚙️ Installation

```bash
# Clone repository
git clone <repository-url>

# Move into project folder
cd root-fact-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🏗 Build for Production

```bash
npm run build
```

---

## 🌐 Deployment

This project is deployed using **Netlify**.

Production URL: `<your-netlify-url>`

---

## 📦 PWA Support

This application supports:

- Installable experience
- Offline access
- Cached AI models
- Service Worker registration
- Web App Manifest

**To install:** Open the app in a supported browser, then click **Install App** or **Add to Home Screen**.

---

## 📄 License

This project was developed for educational purposes as part of the **Dicoding AI Web Application** submission project.
