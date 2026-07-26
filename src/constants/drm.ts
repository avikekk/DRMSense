/**
 * EME key system registry.
 *
 * Modelled on the key systems Shaka Player probes, which is the de-facto
 * cross-platform reference. Grouped into families because a single DRM
 * (PlayReady especially) is reachable through several key system strings with
 * different security guarantees, and we want to report the strongest one the
 * browser accepts.
 *
 * Spec: Encrypted Media Extensions v2, W3C Working Draft 07 July 2026.
 */

/**
 * Union of every initialization data type in use across platforms.
 *
 * This is the single most important detail for cross-platform detection:
 * `cenc` alone is what Widevine and PlayReady want, but FairPlay on
 * Safari/iOS/iPadOS rejects it outright and needs `sinf` or `skd`. Probing
 * with only `cenc` makes Apple platforms look like they have no DRM at all.
 * The spec matches if *any* listed type is supported, so the union is safe.
 */
export const INIT_DATA_TYPES = ['cenc', 'sinf', 'skd', 'keyids'];

/** decodingInfo takes a single initDataType, so Apple platforms need this one. */
export const FAIRPLAY_INIT_DATA_TYPE = 'sinf';

/**
 * Capability lists are unions too: Safari has no WebM and Firefox on some
 * platforms has no MP4/H.264, so offering both lets each browser match on
 * whichever it actually supports.
 */
export const BASE_VIDEO_CAPABILITIES = [
  { contentType: 'video/mp4;codecs="avc1.42E01E"' },
  { contentType: 'video/webm;codecs="vp8"' },
];

export const BASE_AUDIO_CAPABILITIES = [
  { contentType: 'audio/mp4;codecs="mp4a.40.2"' },
  { contentType: 'audio/webm;codecs="opus"' },
];

/** Widevine robustness ladder, strongest first. */
export const WIDEVINE_ROBUSTNESS = [
  'HW_SECURE_ALL',
  'HW_SECURE_DECODE',
  'HW_SECURE_CRYPTO',
  'SW_SECURE_DECODE',
  'SW_SECURE_CRYPTO',
];

/** PlayReady robustness ladder, strongest first. SL3000 > SL2000 > SL150. */
export const PLAYREADY_ROBUSTNESS = ['3000', '2000', '150'];

/** EME v2 encryption schemes. `null` means "no preference". */
export const ENCRYPTION_SCHEMES = ['cenc', 'cbcs', 'cbcs-1-9'];

/** HDCP versions queryable via EME v2 `getStatusForPolicy()`, weakest first. */
export const HDCP_VERSIONS = ['1.0', '1.1', '1.2', '1.3', '1.4', '2.0', '2.1', '2.2', '2.3'];

export interface KeySystemVariant {
  keySystem: string;
  label: string;
}

export interface DRMFamily {
  name: string;
  icon: string;
  /** Platforms this family is expected on — shown as UI context. */
  platforms: string;
  /** Key system strings, strongest/most-preferred first. */
  variants: KeySystemVariant[];
  robustness: string[];
}

export const DRM_FAMILIES: DRMFamily[] = [
  {
    name: 'Widevine',
    icon: 'Shield',
    platforms: 'Android, Windows, macOS, Linux, ChromeOS',
    variants: [{ keySystem: 'com.widevine.alpha', label: 'Widevine' }],
    robustness: WIDEVINE_ROBUSTNESS,
  },
  {
    name: 'PlayReady',
    icon: 'ShieldCheck',
    platforms: 'Windows, Xbox, some smart TVs',
    variants: [
      {
        keySystem: 'com.microsoft.playready.recommendation.3000',
        label: 'Recommendation SL3000 (hardware)',
      },
      { keySystem: 'com.microsoft.playready.hardware', label: 'Hardware' },
      { keySystem: 'com.microsoft.playready.recommendation', label: 'Recommendation' },
      { keySystem: 'com.microsoft.playready', label: 'Standard' },
    ],
    robustness: PLAYREADY_ROBUSTNESS,
  },
  {
    name: 'FairPlay',
    icon: 'ShieldAlert',
    platforms: 'Safari on macOS, iOS, iPadOS, tvOS',
    variants: [
      { keySystem: 'com.apple.fps', label: 'Modern EME' },
      { keySystem: 'com.apple.fps.1_0', label: 'Legacy (fps.1_0)' },
    ],
    // FairPlay exposes no robustness strings; it is hardware-backed by design.
    robustness: [],
  },
  {
    name: 'WisePlay',
    icon: 'ShieldLock',
    platforms: 'Huawei HarmonyOS / Android',
    variants: [{ keySystem: 'com.huawei.wiseplay', label: 'WisePlay' }],
    robustness: [],
  },
  {
    name: 'ClearKey',
    icon: 'Key',
    platforms: 'All platforms (W3C baseline)',
    variants: [{ keySystem: 'org.w3.clearkey', label: 'W3C ClearKey' }],
    robustness: [],
  },
];

/**
 * Widevine robustness → device security level.
 * HW_SECURE_DECODE and above means decoded frames never leave the TEE (L1);
 * HW_SECURE_CRYPTO keeps only keys in hardware (L2); anything SW_* is L3.
 */
export const WIDEVINE_SECURITY_LEVELS: Record<string, string> = {
  HW_SECURE_ALL: 'L1 (Hardware)',
  HW_SECURE_DECODE: 'L1 (Hardware)',
  HW_SECURE_CRYPTO: 'L2 (Hybrid)',
  SW_SECURE_DECODE: 'L3 (Software)',
  SW_SECURE_CRYPTO: 'L3 (Software)',
};

export const PLAYREADY_SECURITY_LEVELS: Record<string, string> = {
  '3000': 'SL3000 (Hardware)',
  '2000': 'SL2000 (Software)',
  '150': 'SL150 (Development)',
};

/**
 * Sampled per key system to report which codecs work *under DRM*, which is not
 * the same question as whether the browser can decode them in the clear.
 */
export const DRM_PROBE_CODECS = [
  { name: 'H.264', mimeType: 'video/mp4;codecs="avc1.42E01E"' },
  { name: 'HEVC', mimeType: 'video/mp4;codecs="hvc1.1.6.L93.B0"' },
  { name: 'VP9', mimeType: 'video/webm;codecs="vp9"' },
  { name: 'AV1', mimeType: 'video/mp4;codecs="av01.0.05M.08"' },
];
