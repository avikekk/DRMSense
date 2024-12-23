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

export interface AudioCodec {
  name: string;
  mimeType: string;
  supported: boolean;
}

export interface HDRCapability {
  name: string;
  supported: boolean;
  description: string;
}

export interface DRMSystem {
  name: string;
  keySystem: string;
  icon: string;
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