export interface Resolution {
  width: number;
  height: number;
  name: string;
}

export interface Codec {
  name: string;
  mimeType: string;
  supported: boolean;
}

export interface DetailedCodecInfo extends Codec {
  profile?: string;
  level?: string;
  smooth?: boolean; // From mediaCapabilities.decodingInfo
  powerEfficient?: boolean; // From mediaCapabilities.decodingInfo
}

export interface AudioCodec {
  name: string;
  mimeType: string;
  supported: boolean;
}

export interface DetailedAudioCodecInfo extends AudioCodec {
  bitrate?: number;
  channels?: number;
}

export interface HDRCapability {
  name: string;
  supported: boolean;
  description: string;
  transferFunction?: string;
}

export interface DisplayCapabilities {
  colorGamut: {
    sRGB: boolean;
    p3: boolean;
    rec2020: boolean;
  };
  hdr: {
    supported: boolean;
    formats: HDRCapability[];
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth: number;
  };
}

export interface DRMSystem {
  name: string;
  keySystem: string;
  icon: string;
}

export interface DetailedMediaCapabilities {
  videoCodecs: DetailedCodecInfo[];
  audioCodecs: DetailedAudioCodecInfo[];
  display: DisplayCapabilities;
}

export interface DRMSystemInfo extends DRMSystem {
  supported: boolean;
  supportedResolutions: Resolution[];
  persistentLicenseSupport: boolean;
  securityLevel: string;
  supportedCodecs: Codec[];
  supportedAudioCodecs: AudioCodec[];
  hdrCapabilities: HDRCapability[];
}

export interface SystemInfo {
  os: string;
  browser: string;
  version: string;
}

export interface VideoConfiguration {
  contentType: string;
  width: number;
  height: number;
  bitrate: number;
  framerate: number;
}