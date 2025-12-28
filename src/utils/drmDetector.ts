import { DRMSystem, DRMSystemInfo, Resolution, DetailedCodecInfo, DetailedAudioCodecInfo, DetailedMediaCapabilities, DisplayCapabilities } from '../types/drm';
import {
  VIDEO_CODECS_TO_TEST,
  AUDIO_CODECS_TO_TEST,
  checkAdvancedVideoSupport,
  checkAdvancedAudioSupport,
  detectAdvancedHDRSupport,
  detectDisplayCapabilities
} from './mediaCapabilities';

const WIDEVINE_KEYSYSTEM = 'com.widevine.alpha';
const PLAYREADY_KEYSYSTEM = 'com.microsoft.playready';
const FAIRPLAY_KEYSYSTEM = 'com.apple.fps';

const TEST_RESOLUTIONS: Resolution[] = [
  { width: 854, height: 480, name: '480p' },
  { width: 1280, height: 720, name: '720p' },
  { width: 1920, height: 1080, name: '1080p' },
  { width: 3840, height: 2160, name: '4K' }
];

async function checkPersistentLicenseSupport(keySystem: string): Promise<boolean> {
  try {
    const config = {
      initDataTypes: ['cenc'],
      persistentState: 'required' as const,
      sessionTypes: ['persistent-license'],
      audioCapabilities: [{
        contentType: 'audio/mp4;codecs="mp4a.40.2"',
        robustness: ''
      }]
    };
    await navigator.requestMediaKeySystemAccess(keySystem, [config]);
    return true;
  } catch {
    return false;
  }
}

export async function detectMediaAndDRM(): Promise<{ drmSystems: DRMSystemInfo[], mediaCapabilities: DetailedMediaCapabilities }> {
  const displayCaps = detectDisplayCapabilities();
  const advancedHDR = await detectAdvancedHDRSupport();

  // 1. Detect pure media capabilities (Codecs)
  const videoCodecs: DetailedCodecInfo[] = [];
  for (const codec of VIDEO_CODECS_TO_TEST) {
    videoCodecs.push(await checkAdvancedVideoSupport(codec));
  }

  const audioCodecs: DetailedAudioCodecInfo[] = [];
  for (const codec of AUDIO_CODECS_TO_TEST) {
    audioCodecs.push(await checkAdvancedAudioSupport(codec));
  }

  const mediaCapabilities: DetailedMediaCapabilities = {
    videoCodecs,
    audioCodecs,
    display: {
      ...displayCaps,
      hdr: {
        ...displayCaps.hdr,
        formats: advancedHDR
      }
    }
  };

  // 2. Detect DRM Systems
  if (!window.navigator.requestMediaKeySystemAccess) {
    return { drmSystems: [], mediaCapabilities };
  }

  const drmSystemsInput: DRMSystem[] = [
    { name: 'Widevine', keySystem: WIDEVINE_KEYSYSTEM, icon: 'Shield' },
    { name: 'PlayReady', keySystem: PLAYREADY_KEYSYSTEM, icon: 'ShieldCheck' },
    { name: 'FairPlay', keySystem: FAIRPLAY_KEYSYSTEM, icon: 'ShieldAlert' }
  ];

  const drmResults: DRMSystemInfo[] = [];

  for (const drm of drmSystemsInput) {
    const supportedResolutions: Resolution[] = [];
    let securityLevel = 'Unknown';
    let persistentLicenseSupport = false;

    // We can reuse the extensive codec list, but EME `requestMediaKeySystemAccess` has strict rules.
    // It's often safer to stick to a basic set for the "Does this DRM work?" check, 
    // BUT we can use the `supportedCodecs` field to report widely.
    // For the UI, we'll just check specific codecs roughly or map the general ones.

    // Let's re-map the general codec list to a simple boolean structure for the DRM card
    // or just assume if the key system works, it supports the codecs the browser supports generally (mostly true).

    // However, to fill the `supportedCodecs` on the DRM card, we'll check a subset specifically WITH the key system.
    // This is expensive, so maybe we only check a few representative ones.

    const representativeVideo = [
      { name: 'H.264', mimeType: 'video/mp4;codecs="avc1.42E01E"' },
      { name: 'HEVC', mimeType: 'video/mp4;codecs="hvc1.1.6.L93.B0"' },
      { name: 'VP9', mimeType: 'video/webm;codecs="vp9"' }
    ];

    const supportedDrmCodecs: DetailedCodecInfo[] = [];

    // Test Resolution (using H.264 as base)
    for (const resolution of TEST_RESOLUTIONS) {
      try {
        const config = {
          initDataTypes: ['cenc'],
          audioCapabilities: [{ contentType: 'audio/mp4;codecs="mp4a.40.2"' }],
          videoCapabilities: [{
            contentType: 'video/mp4;codecs="avc1.42E01E"',
            width: resolution.width,
            height: resolution.height
          }]
        };
        await navigator.requestMediaKeySystemAccess(drm.keySystem, [config]);
        supportedResolutions.push(resolution);
      } catch {
        continue;
      }
    }

    if (supportedResolutions.length > 0) {
      // DRM supported
      try {
        persistentLicenseSupport = await checkPersistentLicenseSupport(drm.keySystem);

        // Security Level Probe
        try {
          const config = {
            initDataTypes: ['cenc'],
            videoCapabilities: [{
              contentType: 'video/mp4;codecs="avc1.42E01E"',
              robustness: 'HW_SECURE_ALL'
            }]
          };
          await navigator.requestMediaKeySystemAccess(drm.keySystem, [config]);
          securityLevel = 'L1 (Hardware)';
        } catch {
          securityLevel = 'L3 (Software)';
        }

        // Check specific codecs WITH this DRM
        for (const c of representativeVideo) {
          try {
            await navigator.requestMediaKeySystemAccess(drm.keySystem, [{
              initDataTypes: ['cenc'],
              videoCapabilities: [{ contentType: c.mimeType }]
            }]);
            supportedDrmCodecs.push({ ...c, supported: true });
          } catch {
            supportedDrmCodecs.push({ ...c, supported: false });
          }
        }

      } catch { }

      drmResults.push({
        ...drm,
        supported: true,
        supportedResolutions,
        persistentLicenseSupport,
        securityLevel,
        supportedCodecs: supportedDrmCodecs,
        supportedAudioCodecs: [], // We can populate if needed, but video is the main differentiator
        hdrCapabilities: advancedHDR.filter(h => h.supported) // Assume if DRM + HDR supported generally, it works
      });
    } else {
      drmResults.push({
        ...drm,
        supported: false,
        supportedResolutions: [],
        persistentLicenseSupport: false,
        securityLevel: 'Not Supported',
        supportedCodecs: [],
        supportedAudioCodecs: [],
        hdrCapabilities: []
      });
    }
  }

  return { drmSystems: drmResults, mediaCapabilities };
}

// Keep the old function signature for backward compatibility if needed,
// OR refactor the caller. The plan implies we migrate, so let's export the new one
// and maybe a wrapper if strictly required.
// For now, I'll export `detectDRMSupport` as an alias alias or wrapper if I can't change App.tsx conveniently,
// but I CAN change App.tsx. So I will rely on `detectMediaAndDRM`.
