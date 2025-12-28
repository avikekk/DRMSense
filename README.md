# DRMSense

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-61DAFB.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg) ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)

**DRMSense** is a modern, high-precision web utility designed to analyze and visualize your browser's Digital Rights Management (DRM) capabilities and media support. Built with a focus on aesthetics and performance, it provides developers and streaming enthusiasts with detailed insights into what their current environment can handle.

## ✨ Features

### 🛡️ DRM System Analysis
Detects support and security levels for major DRM systems:
- **Google Widevine** (L1/L3 detection)
- **Microsoft PlayReady**
- **Apple FairPlay**
- **Persistent License** & **Session Support** checks

### 🎥 Deep Media Inspection
Goes beyond basic checks to verify specific codec and resolution support:
- **Video Codecs**: AV1, HEVC (H.265), VP9, H.264
- **Audio Codecs**: Dolby Digital (AC3), E-AC3, FLAC, Opus, AAC
- **HDR Capabilities**: Dolby Vision, HDR10, HLG
- **Display Info**: Color Gamut (P3, sRGB), Refresh Rate (when available)

### 🚀 Modern Experience
- **Premium UI**: Clean, glassmorphic design with smooth micro-animations.
- **Dark Mode**: Fully supported system-aware dark/light theming.
- **Privacy Focused**: All checks are performed locally in your browser. No data is sent to external servers.
- **Data Export**: One-click export of all technical data to JSON for debugging or sharing.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Google Sans Flex

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avikekk/DRMSense.git
   cd DRMSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
