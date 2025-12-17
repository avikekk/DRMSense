# DRMSense

A modern web application that detects and displays your browser's Digital Rights Management (DRM) capabilities, including Widevine, PlayReady, and FairPlay support.

<p align="center">
  <a href="https://drmsense.netlify.app">🌐 Live Demo</a> · 
  <a href="#features">✨ Features</a> · 
  <a href="#getting-started">🚀 Getting Started</a> · 
  <a href="#browser-compatibility">🌍 Compatibility</a>
</p>

---

## Features

- 🛡️ **DRM System Detection** - Detect Widevine, PlayReady, and FairPlay support
- 🎥 **Video Resolution Support** - Check support for 480p, 720p, 1080p, and 4K resolutions
- 🎨 **HDR Capabilities** - Detect HDR10, Dolby Vision, and HLG support
- 🔊 **Audio Codec Support** - Test AAC, AC3, E-AC3, FLAC, Opus, and Vorbis compatibility
- 🎬 **Video Codec Support** - Check H.264, HEVC, VP9, and AV1 support
- 💾 **Export Results** - Download complete capability report as JSON
- 🌓 **Dark Mode** - Automatic dark mode with manual toggle
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessible** - Built with accessibility in mind (ARIA labels, keyboard navigation)

---

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **DRM Detection**: Encrypted Media Extensions (EME) API
- **Deployment**: Netlify

---

## Browser Compatibility

### DRM Support
| Browser | Widevine | PlayReady | FairPlay |
|---------|----------|-----------|----------|
| Chrome | ✅ | ❌ | ❌ |
| Edge | ✅ | ✅ | ❌ |
| Firefox | ✅ | ❌ | ❌ |
| Safari | ❌ | ❌ | ✅ |
| Opera | ✅ | ❌ | ❌ |
| Brave | ✅ | ❌ | ❌ |

### Requirements
- Modern browser with EME API support
- JavaScript enabled
- HTTPS connection (for some DRM features)

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/drmsense.git
cd drmsense

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Run linting
npm run lint

# Run development server with hot reload
npm run dev
```

The development server will start at `http://localhost:5173`

---

## Architecture

```
src/
├── components/          # React components
│   ├── DRMCard.tsx     # Individual DRM system display
│   ├── SystemInfoCard.tsx  # System information display
│   ├── ThemeToggle.tsx     # Dark mode toggle
│   └── ErrorBoundary.tsx   # Error handling wrapper
├── hooks/              # Custom React hooks
│   └── useTheme.ts     # Theme management hook
├── utils/              # Utility functions
│   ├── drmDetector.ts      # DRM detection logic
│   ├── mediaCapabilities.ts # Media capability detection
│   └── systemInfo.ts       # Browser/OS detection
├── types/              # TypeScript type definitions
│   └── drm.ts          # DRM-related types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

---

## How It Works

DRMSense leverages the [Encrypted Media Extensions (EME) API](https://www.w3.org/TR/encrypted-media/) to detect DRM capabilities:

1. **System Detection**: Identifies browser and operating system
2. **DRM Querying**: Tests each DRM system (Widevine, PlayReady, FairPlay)
3. **Capability Testing**: Checks supported resolutions, codecs, and HDR
4. **Result Display**: Presents findings in an easy-to-understand interface
5. **Export Option**: Allows downloading complete report as JSON

---

## Troubleshooting

### DRM Detection Fails
- **Ensure HTTPS**: Some DRM features require secure context
- **Check Browser Support**: Verify your browser supports EME API
- **Disable Extensions**: Some privacy extensions may interfere

### Inaccurate Results
- DRM support can vary based on:
  - Hardware capabilities
  - Operating system version
  - Browser version and configuration
  - Installed codecs and drivers

### Dark Mode Not Working
- Check local storage permissions
- Clear browser cache and reload

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Contribution Guide
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy!

### Other Platforms

The built application is a static site and can be deployed to:
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

---

## FAQ

**Q: Why does my browser show "Not Supported" for all DRM systems?**  
A: This could be due to browser configuration, missing codecs, or running in an insecure context (HTTP instead of HTTPS).

**Q: Is my data being collected?**  
A: No. All detection happens locally in your browser. No data is sent to external servers.

**Q: Why is Dolby Vision showing as not supported when I know my device supports it?**  
A: Browser APIs have limited ability to detect Dolby Vision. The detection is based on available browser capabilities and may not reflect true hardware support.

**Q: Can I use this on mobile devices?**  
A: Yes! The app is fully responsive and works on mobile browsers.

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Fontshare](https://www.fontshare.com/)
- Inspired by the need for easy DRM capability testing

---

## Support

- 🐛 [Report a Bug](https://github.com/yourusername/drmsense/issues)
- 💡 [Request a Feature](https://github.com/yourusername/drmsense/issues)
- 📧 Contact: your.email@example.com

---

<p align="center">Made with ❤️ for the web streaming community</p>
