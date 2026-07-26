/**
 * Low-level capability probes.
 *
 * Every capability check in this app is one of two shapes: ask
 * `mediaCapabilities.decodingInfo` whether a decode config works, or ask
 * `requestMediaKeySystemAccess` whether a key system accepts a config. Both
 * signal "no" by rejecting, so the try/catch belongs here rather than at each
 * of the dozen call sites.
 */

export interface DecodingProbeResult {
  supported: boolean;
  smooth: boolean;
  powerEfficient: boolean;
}

/**
 * The Media Capabilities IDL carries several members that TypeScript's DOM lib
 * has not picked up yet (`hasAlphaChannel`, `spatialRendering`, the HDR
 * triplet, SVC scalability). Widen rather than cast at each call site.
 */
export type ExtendedVideoConfiguration = VideoConfiguration & {
  hasAlphaChannel?: boolean;
  hdrMetadataType?: string;
  colorGamut?: string;
  transferFunction?: string;
  scalabilityMode?: string;
  spatialScalability?: boolean;
};

export type ExtendedAudioConfiguration = AudioConfiguration & {
  spatialRendering?: boolean;
};

/** Per-track key system requirements, from the Media Capabilities IDL. */
export interface KeySystemTrackConfiguration {
  robustness?: string;
  encryptionScheme?: string | null;
}

/**
 * Asking `decodingInfo` about *encrypted* playback. This is the only API that
 * answers the combined question — "can this browser decode HEVC at 4K under
 * Widevine L1" — rather than the two halves separately.
 */
export interface DecodingKeySystemConfiguration {
  keySystem: string;
  initDataType?: string;
  distinctiveIdentifier?: MediaKeysRequirement;
  persistentState?: MediaKeysRequirement;
  sessionTypes?: string[];
  audio?: KeySystemTrackConfiguration;
  video?: KeySystemTrackConfiguration;
}

export type DecodingConfig = Omit<
  MediaDecodingConfiguration,
  'video' | 'audio' | 'keySystemConfiguration'
> & {
  video?: ExtendedVideoConfiguration;
  audio?: ExtendedAudioConfiguration;
  keySystemConfiguration?: DecodingKeySystemConfiguration;
};

/**
 * EME v2 adds `encryptionScheme` to media capabilities. TypeScript's DOM lib
 * has not caught up, so widen the built-in type rather than casting at every
 * call site.
 */
export interface KeySystemMediaCapability extends MediaKeySystemMediaCapability {
  encryptionScheme?: string | null;
}

export interface KeySystemConfig
  extends Omit<MediaKeySystemConfiguration, 'videoCapabilities' | 'audioCapabilities'> {
  videoCapabilities?: KeySystemMediaCapability[];
  audioCapabilities?: KeySystemMediaCapability[];
}

/**
 * Probe a decode configuration. Never throws — an unsupported or malformed
 * config reports `supported: false`.
 *
 * `fallbackMimeType` is used only on browsers without the Media Capabilities
 * API, where `MediaSource.isTypeSupported` is the best available answer. Pass
 * `null` to skip the fallback entirely.
 */
export async function probeDecodingInfo(
  config: DecodingConfig,
  fallbackMimeType: string | null,
  label: string,
): Promise<DecodingProbeResult> {
  const outcome: DecodingProbeResult = {
    supported: false,
    smooth: false,
    powerEfficient: false,
  };

  try {
    if ('mediaCapabilities' in navigator) {
      const result = await navigator.mediaCapabilities.decodingInfo(
        config as MediaDecodingConfiguration,
      );
      outcome.supported = result.supported;
      outcome.smooth = result.smooth;
      outcome.powerEfficient = result.powerEfficient;
    } else if (fallbackMimeType !== null) {
      outcome.supported = MediaSource.isTypeSupported(fallbackMimeType);
    }
  } catch (e) {
    console.warn(`Error checking ${label}:`, e);
  }

  return outcome;
}

/**
 * Probe an *encoding* configuration via `mediaCapabilities.encodingInfo`.
 *
 * `type` is `record` (MediaRecorder-style capture to a file) or `webrtc`
 * (realtime transport). Absent on browsers that shipped decodingInfo only.
 */
export async function probeEncodingInfo(
  config: { type: 'record' | 'webrtc'; video?: object; audio?: object },
  label: string,
): Promise<boolean> {
  if (!('mediaCapabilities' in navigator)) return false;

  const mc = navigator.mediaCapabilities as MediaCapabilities & {
    encodingInfo?: (c: object) => Promise<{ supported: boolean }>;
  };
  if (typeof mc.encodingInfo !== 'function') return false;

  try {
    return (await mc.encodingInfo(config)).supported;
  } catch (e) {
    console.warn(`Error checking encoding ${label}:`, e);
    return false;
  }
}

/**
 * Request key system access, returning the access object on success and `null`
 * on rejection. Rejection is the spec's way of saying "unsupported", so it is
 * not an error condition here.
 *
 * The access object matters: `getConfiguration()` reports what the CDM
 * actually negotiated, which is how we learn about persistent-license and
 * distinctive-identifier support without extra round trips.
 */
export async function requestKeySystemAccess(
  keySystem: string,
  config: KeySystemConfig,
): Promise<MediaKeySystemAccess | null> {
  if (!navigator.requestMediaKeySystemAccess) return null;

  try {
    return await navigator.requestMediaKeySystemAccess(keySystem, [
      config as MediaKeySystemConfiguration,
    ]);
  } catch {
    return null;
  }
}

/** Boolean form of {@link requestKeySystemAccess}. */
export async function probeKeySystem(
  keySystem: string,
  config: KeySystemConfig,
): Promise<boolean> {
  return (await requestKeySystemAccess(keySystem, config)) !== null;
}

/**
 * Query the highest HDCP version the output path can guarantee, via the EME v2
 * `getStatusForPolicy()` method.
 *
 * This needs a real `MediaKeys` instance. Creating one can fail (or, on some
 * browsers, require user consent), so every failure mode degrades to an empty
 * list rather than breaking detection.
 */
export async function probeHdcpVersions(
  access: MediaKeySystemAccess,
  versions: string[],
): Promise<string[]> {
  let mediaKeys: MediaKeys;
  try {
    mediaKeys = await access.createMediaKeys();
  } catch {
    return [];
  }

  // getStatusForPolicy is EME v2; older CDMs simply do not have it.
  if (typeof mediaKeys.getStatusForPolicy !== 'function') return [];

  const usable: string[] = [];
  for (const minHdcpVersion of versions) {
    try {
      const status = await mediaKeys.getStatusForPolicy({ minHdcpVersion });
      if (status === 'usable') usable.push(minHdcpVersion);
    } catch {
      // Version unrecognised by this CDM; keep probing the rest.
    }
  }

  return usable;
}
