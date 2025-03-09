import { DRMSystem, DRMSystemInfo, Resolution, Codec } from '../types/drm';
import { TEST_AUDIO_CODECS, checkAudioCodecSupport, detectHDRSupport } from './mediaCapabilities';

const WIDEVINE_KEYSYSTEM = 'com.widevine.alpha';
const PLAYREADY_KEYSYSTEM = 'com.microsoft.playready';
const FAIRPLAY_KEYSYSTEM = 'com.apple.fps';

const TEST_RESOLUTIONS: Resolution[] = [
  { width: 854, height: 480, name: '480p' },
  { width: 1280, height: 720, name: '720p' },
  { width: 1920, height: 1080, name: '1080p' },
  { width: 3840, height: 2160, name: '4K' }
];

const TEST_CODECS: Codec[] = [
  { name: 'H.264', mimeType: 'video/mp4;codecs="avc1.42E01E"', supported: false },
  { name: 'HEVC', mimeType: 'video/mp4;codecs="hevc.1.6.L93.B0"', supported: false },
  { name: 'VP9', mimeType: 'video/webm;codecs="vp9"', supported: false },
  { name: 'AV1', mimeType: 'video/mp4;codecs="av01.0.01M.08"', supported: false },
];

async function checkPersistentLicenseSupport(keySystem: string): Promise<boolean> {
  try {
    const config = {
      initDataTypes: ['cenc'],
      persistentState: 'required',
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

async function checkCodecSupport(codec: Codec): Promise<boolean> {
  return MediaSource.isTypeSupported(codec.mimeType);
}

export async function detectDRMSupport(): Promise<DRMSystemInfo[]> {
  if (!window.navigator.requestMediaKeySystemAccess) {
    return [];
  }

  const drmSystems: DRMSystem[] = [
    {
      name: 'Widevine',
      keySystem: WIDEVINE_KEYSYSTEM,
      icon: 'Shield'
    },
    {
      name: 'PlayReady',
      keySystem: PLAYREADY_KEYSYSTEM,
      icon: 'ShieldCheck'
    },
    {
      name: 'FairPlay',
      keySystem: FAIRPLAY_KEYSYSTEM,
      icon: 'ShieldAlert'
    }
  ];

  // Detect HDR capabilities
  const hdrCapabilities = await detectHDRSupport();

  // Check audio codec support
  const supportedAudioCodecs = [...TEST_AUDIO_CODECS];
  for (let i = 0; i < supportedAudioCodecs.length; i++) {
    supportedAudioCodecs[i].supported = await checkAudioCodecSupport(supportedAudioCodecs[i]);
  }

  const results: DRMSystemInfo[] = [];

  for (const drm of drmSystems) {
    const supportedResolutions: Resolution[] = [];
    let securityLevel = 'Unknown';
    let persistentLicenseSupport = false;
    const supportedCodecs = [...TEST_CODECS];

    // Test each resolution
    for (const resolution of TEST_RESOLUTIONS) {
      try {
        const config = {
          initDataTypes: ['cenc'],
          audioCapabilities: [{
            contentType: 'audio/mp4;codecs="mp4a.40.2"',
            robustness: ''
          }],
          videoCapabilities: [{
            contentType: 'video/mp4;codecs="avc1.42E01E"',
            robustness: '',
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

    // If DRM is supported, check additional capabilities
    if (supportedResolutions.length > 0) {
      try {
        persistentLicenseSupport = await checkPersistentLicenseSupport(drm.keySystem);
        
        // Check codec support
        for (let i = 0; i < supportedCodecs.length; i++) {
          supportedCodecs[i].supported = await checkCodecSupport(supportedCodecs[i]);
        }

        // Try to determine security level
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
      } catch {
        // If additional checks fail, continue with basic support info
      }

      results.push({
        ...drm,
        supported: true,
        supportedResolutions,
        persistentLicenseSupport,
        securityLevel,
        supportedCodecs,
        supportedAudioCodecs,
        hdrCapabilities
      });
    } else {
      results.push({
        ...drm,
        supported: false,
        supportedResolutions: [],
        persistentLicenseSupport: false,
        securityLevel: 'Not Supported',
        supportedCodecs: supportedCodecs.map(codec => ({ ...codec, supported: false })),
        supportedAudioCodecs: supportedAudioCodecs.map(codec => ({ ...codec, supported: false })),
        hdrCapabilities
      });
    }
  }

  return results;
}
