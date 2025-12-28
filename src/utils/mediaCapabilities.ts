import { DetailedCodecInfo, DetailedAudioCodecInfo, DisplayCapabilities, HDRCapability } from '../types/drm';

// Comprehensive list of Video Codecs to test
export const VIDEO_CODECS_TO_TEST = [
  // H.264 / AVC
  { name: 'H.264 (Baseline)', mimeType: 'video/mp4;codecs="avc1.42E01E"', profile: 'Baseline' },
  { name: 'H.264 (Main)', mimeType: 'video/mp4;codecs="avc1.4D401E"', profile: 'Main' },
  { name: 'H.264 (High)', mimeType: 'video/mp4;codecs="avc1.64001E"', profile: 'High' },

  // H.265 / HEVC
  { name: 'HEVC (Main)', mimeType: 'video/mp4;codecs="hvc1.1.6.L93.B0"', profile: 'Main' },
  { name: 'HEVC (Main 10)', mimeType: 'video/mp4;codecs="hvc1.2.4.L153.B0"', profile: 'Main 10' },

  // VP9
  { name: 'VP9 (Profile 0)', mimeType: 'video/webm;codecs="vp9"', profile: 'Profile 0' },
  { name: 'VP9 (Profile 2)', mimeType: 'video/webm;codecs="vp09.02.10.10.01"', profile: 'Profile 2' },

  // AV1
  { name: 'AV1 (Main)', mimeType: 'video/mp4;codecs="av01.0.05M.08"', profile: 'Main' },
  { name: 'AV1 (High)', mimeType: 'video/mp4;codecs="av01.1.05M.08"', profile: 'High' },

  // Legacy / Others
  { name: 'VP8', mimeType: 'video/webm;codecs="vp8"', profile: 'Standard' },
  { name: 'Theora', mimeType: 'video/ogg;codecs="theora"', profile: 'Standard' },
];

// Comprehensive list of Audio Codecs to test
export const AUDIO_CODECS_TO_TEST = [
  { name: 'AAC-LC', mimeType: 'audio/mp4;codecs="mp4a.40.2"' },
  { name: 'HE-AAC', mimeType: 'audio/mp4;codecs="mp4a.40.5"' },
  { name: 'MP3', mimeType: 'audio/mpeg' },
  { name: 'Ogg Vorbis', mimeType: 'audio/ogg;codecs="vorbis"' },
  { name: 'Opus', mimeType: 'audio/ogg;codecs="opus"' },
  { name: 'FLAC', mimeType: 'audio/flac' },
  { name: 'AC-3 (Dolby Digital)', mimeType: 'audio/mp4;codecs="ac-3"' },
  { name: 'E-AC-3 (Dolby Digital Plus)', mimeType: 'audio/mp4;codecs="ec-3"' },
  { name: 'DTS', mimeType: 'audio/mp4;codecs="dts-"' }, // Basic check, specific codes vary
  { name: 'ALAC', mimeType: 'audio/mp4;codecs="alac"' },
  { name: 'PCM', mimeType: 'audio/wav;codecs="1"' } // Linear PCM
];

export async function checkAdvancedVideoSupport(codecBase: { name: string, mimeType: string, profile?: string }): Promise<DetailedCodecInfo> {
  const config = {
    type: 'media-source' as const, // 'file' or 'media-source' or 'webrtc'
    video: {
      contentType: codecBase.mimeType,
      width: 1920,
      height: 1080,
      bitrate: 2646242, // ~2.5Mbps (arbitrary typical value)
      framerate: 60
    }
  };

  let outcome: DetailedCodecInfo = {
    ...codecBase,
    supported: false,
    smooth: false,
    powerEfficient: false
  };

  try {
    if ('mediaCapabilities' in navigator) {
      const result = await navigator.mediaCapabilities.decodingInfo(config);
      outcome.supported = result.supported;
      outcome.smooth = result.smooth;
      outcome.powerEfficient = result.powerEfficient;
    } else {
      // Fallback to older MediaSource API or canPlayType
      outcome.supported = MediaSource.isTypeSupported(codecBase.mimeType);
    }
  } catch (e) {
    console.warn(`Error checking codec ${codecBase.name}:`, e);
  }
  return outcome;
}

export async function checkAdvancedAudioSupport(codecBase: { name: string, mimeType: string }): Promise<DetailedAudioCodecInfo> {
  const config = {
    type: 'media-source' as const,
    audio: {
      contentType: codecBase.mimeType,
      channels: "2",
      bitrate: 132300,
      samplerate: 48000
    }
  };

  let outcome: DetailedAudioCodecInfo = {
    ...codecBase,
    supported: false
  };

  try {
    if ('mediaCapabilities' in navigator) {
      const result = await navigator.mediaCapabilities.decodingInfo(config);
      outcome.supported = result.supported;
    } else {
      outcome.supported = MediaSource.isTypeSupported(codecBase.mimeType);
    }
  } catch (e) {
    console.warn(`Error checking audio codec ${codecBase.name}:`, e);
  }
  return outcome;
}

export function detectDisplayCapabilities(): DisplayCapabilities {
  const caps: DisplayCapabilities = {
    colorGamut: {
      sRGB: false,
      p3: false,
      rec2020: false
    },
    hdr: {
      supported: false,
      formats: []
    },
    screen: {
      width: 0,
      height: 0,
      colorDepth: 0,
      pixelDepth: 0
    }
  };

  if (typeof window !== 'undefined') {
    // Color Gamut
    caps.colorGamut.sRGB = window.matchMedia('(color-gamut: srgb)').matches;
    caps.colorGamut.p3 = window.matchMedia('(color-gamut: p3)').matches;
    caps.colorGamut.rec2020 = window.matchMedia('(color-gamut: rec2020)').matches;

    // Screen Info
    caps.screen.width = window.screen.width;
    caps.screen.height = window.screen.height;
    caps.screen.colorDepth = window.screen.colorDepth;
    caps.screen.pixelDepth = window.screen.pixelDepth;

    // HDR Support
    caps.hdr.supported = window.matchMedia('(dynamic-range: high)').matches;
  }
  return caps;
}

// HDR Detection logic (merged and expanded)
export async function detectAdvancedHDRSupport(): Promise<HDRCapability[]> {
  const hdrCapabilities: HDRCapability[] = [
    { name: 'HDR10', supported: false, description: 'High Dynamic Range 10-bit', transferFunction: 'pq' },
    { name: 'Dolby Vision', supported: false, description: 'Dolby Vision (Proprietary)', transferFunction: 'pq' },
    { name: 'HLG', supported: false, description: 'Hybrid Log-Gamma', transferFunction: 'hlg' }
  ];

  if (!('mediaCapabilities' in navigator)) return hdrCapabilities;

  // Basic CSS Check
  const isHDR = window.matchMedia('(dynamic-range: high)').matches;
  if (isHDR) {
    // If CSS says HDR, we can optimistically set HDR10 as likely supported if we can verify VP9/HEVC 10-bit decode
    // But mediaCapabilities is the source of truth
  }

  // Check specific formats via mediaCapabilities
  // 1. HDR10 (PQ) with HEVC Main 10
  // 2. HLG with VP9 Profile 2 or HEVC Main 10

  // We check a representative config for each
  const hdr10Config = {
    type: 'media-source' as const,
    video: {
      contentType: 'video/mp4;codecs="hvc1.2.4.L153.B0"', // HEVC Main 10
      width: 3840,
      height: 2160,
      bitrate: 10000000,
      framerate: 24,
      transferFunction: 'pq' as const
    }
  };

  try {
    const result = await navigator.mediaCapabilities.decodingInfo(hdr10Config);
    if (result.supported) {
      const cap = hdrCapabilities.find(c => c.name === 'HDR10');
      if (cap) cap.supported = true;
    }
  } catch { }

  const hlgConfig = {
    type: 'media-source' as const,
    video: {
      contentType: 'video/webm;codecs="vp9.02"', // VP9 Profile 2 (often used for YouTube HDR)
      width: 3840,
      height: 2160,
      bitrate: 10000000,
      framerate: 60,
      transferFunction: 'hlg' as const
    }
  };

  try {
    const result = await navigator.mediaCapabilities.decodingInfo(hlgConfig);
    if (result.supported) {
      const cap = hdrCapabilities.find(c => c.name === 'HLG');
      if (cap) cap.supported = true;
    }
  } catch { }

  // Dolby Vision usually requires specific container/codec combos (e.g., dvhe)
  // Checking P3 gamut support as a proxy for "capable display" often correlates with DV support on Apple devices
  if (window.matchMedia('(color-gamut: p3)').matches) {
    // This is a weak signal, but without a specific sample file or proprietary API, 
    // we assume if it supports HEVC Main 10 + P3, it MIGHT support DV.
    // Better to check a specific Dolby codec string if known.
    const dvConfig = {
      type: 'media-source' as const,
      video: {
        contentType: 'video/mp4;codecs="dvhe.05.06"', // Example DV codec string
        width: 1920,
        height: 1080,
        bitrate: 5000000,
        framerate: 24
      }
    };
    try {
      const result = await navigator.mediaCapabilities.decodingInfo(dvConfig);
      if (result.supported) {
        const cap = hdrCapabilities.find(c => c.name === 'Dolby Vision');
        if (cap) cap.supported = true;
      }
    } catch { }
  }

  return hdrCapabilities;
}