import { AudioCodec, HDRCapability } from '../types/drm';

export const TEST_AUDIO_CODECS: AudioCodec[] = [
  { name: 'AAC', mimeType: 'audio/mp4;codecs="mp4a.40.2"', supported: false },
  { name: 'AC3 (Dolby Digital)', mimeType: 'audio/mp4;codecs="ac-3"', supported: false },
  { name: 'E-AC3 (Dolby Digital Plus)', mimeType: 'audio/mp4;codecs="ec-3"', supported: false },
  { name: 'FLAC', mimeType: 'audio/flac', supported: false },
  { name: 'Opus', mimeType: 'audio/opus', supported: false },
  { name: 'Vorbis', mimeType: 'audio/ogg', supported: false }
];

export const HDR_CAPABILITIES: HDRCapability[] = [
  {
    name: 'HDR10',
    supported: false,
    description: 'High Dynamic Range 10-bit'
  },
  {
    name: 'Dolby Vision',
    supported: false,
    description: 'Advanced HDR format by Dolby'
  },
  {
    name: 'HLG',
    supported: false,
    description: 'Hybrid Log-Gamma HDR'
  }
];

export async function checkAudioCodecSupport(codec: AudioCodec): Promise<boolean> {
  return MediaSource.isTypeSupported(codec.mimeType);
}

export async function detectHDRSupport(): Promise<HDRCapability[]> {
  const hdrCapabilities = [...HDR_CAPABILITIES];
  
  if ('window' in globalThis && 'matchMedia' in window) {
    // Check HDR support using CSS media query
    const hdrSupport = window.matchMedia('(dynamic-range: high)').matches;
    
    // If HDR is supported, we'll assume HDR10 support as it's the base HDR format
    if (hdrSupport) {
      const hdr10 = hdrCapabilities.find(cap => cap.name === 'HDR10');
      if (hdr10) hdr10.supported = true;
    }

    // Check color-gamut support for Dolby Vision inference
    const wideColorGamut = window.matchMedia('(color-gamut: p3)').matches;
    if (wideColorGamut) {
      const dolbyVision = hdrCapabilities.find(cap => cap.name === 'Dolby Vision');
      if (dolbyVision) dolbyVision.supported = true;
    }

    // HLG support check
    try {
      const mediaCapabilities = (navigator as any).mediaCapabilities;
      if (mediaCapabilities) {
        const hlgConfig = {
          type: 'media-source',
          video: {
            contentType: 'video/mp4;codecs="avc1.42E01E"',
            width: 1920,
            height: 1080,
            framerate: 30,
            transferFunction: 'hlg'
          }
        };
        
        const hlgSupport = await mediaCapabilities.decodingInfo(hlgConfig);
        const hlg = hdrCapabilities.find(cap => cap.name === 'HLG');
        if (hlg) hlg.supported = hlgSupport.supported;
      }
    } catch (error) {
      console.warn('HLG support detection failed:', error);
    }
  }

  return hdrCapabilities;
}