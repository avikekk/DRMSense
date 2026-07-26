import type {
  DRMSystemInfo,
  EncryptedCodecSupport,
  HDRCapability,
  KeySystemResult,
} from '../types/drm';
import {
  BASE_AUDIO_CAPABILITIES,
  BASE_VIDEO_CAPABILITIES,
  DRM_FAMILIES,
  DRM_PROBE_CODECS,
  ENCRYPTION_SCHEMES,
  HDCP_VERSIONS,
  FAIRPLAY_INIT_DATA_TYPE,
  INIT_DATA_TYPES,
  PLAYREADY_SECURITY_LEVELS,
  WIDEVINE_SECURITY_LEVELS,
  type DRMFamily,
} from '../constants/drm';
import { RESOLUTION_LADDER } from '../constants/codecs';
import {
  probeDecodingInfo,
  probeHdcpVersions,
  probeKeySystem,
  requestKeySystemAccess,
  type DecodingKeySystemConfiguration,
  type KeySystemConfig,
} from './probe';

/** The permissive baseline config: matches if the CDM supports anything we offer. */
function baseConfig(): KeySystemConfig {
  return {
    initDataTypes: INIT_DATA_TYPES,
    videoCapabilities: [...BASE_VIDEO_CAPABILITIES],
    audioCapabilities: [...BASE_AUDIO_CAPABILITIES],
  };
}

/**
 * Walk a family's key system strings strongest-first and return the first that
 * the browser accepts, alongside the per-variant results for reporting.
 *
 * PlayReady is the reason this exists: `com.microsoft.playready` succeeds
 * almost everywhere on Windows, but only the `.recommendation.3000` string
 * tells you hardware DRM is actually available.
 */
async function resolveFamily(family: DRMFamily): Promise<{
  keySystems: KeySystemResult[];
  active: { keySystem: string; access: MediaKeySystemAccess } | null;
}> {
  const keySystems: KeySystemResult[] = [];
  let active: { keySystem: string; access: MediaKeySystemAccess } | null = null;

  for (const variant of family.variants) {
    const access = await requestKeySystemAccess(variant.keySystem, baseConfig());
    keySystems.push({ ...variant, supported: access !== null });
    if (access && !active) active = { keySystem: variant.keySystem, access };
  }

  return { keySystems, active };
}

/**
 * Find every robustness string the CDM accepts. The list is ordered
 * strongest-first, so the first hit determines the reported security level.
 */
async function probeRobustness(
  keySystem: string,
  levels: string[],
  kind: 'video' | 'audio',
): Promise<string[]> {
  const accepted: string[] = [];

  const contentType =
    kind === 'video'
      ? BASE_VIDEO_CAPABILITIES[0].contentType
      : BASE_AUDIO_CAPABILITIES[0].contentType;

  for (const robustness of levels) {
    const capabilities = [{ contentType, robustness }];
    const ok = await probeKeySystem(keySystem, {
      initDataTypes: INIT_DATA_TYPES,
      ...(kind === 'video'
        ? { videoCapabilities: capabilities }
        : { audioCapabilities: capabilities }),
    });
    if (ok) accepted.push(robustness);
  }

  return accepted;
}

/** EME v2 `encryptionScheme` negotiation — which schemes the CDM will decrypt. */
async function probeEncryptionSchemes(keySystem: string): Promise<string[]> {
  const accepted: string[] = [];

  for (const encryptionScheme of ENCRYPTION_SCHEMES) {
    const ok = await probeKeySystem(keySystem, {
      initDataTypes: INIT_DATA_TYPES,
      videoCapabilities: BASE_VIDEO_CAPABILITIES.map((c) => ({ ...c, encryptionScheme })),
    });
    if (ok) accepted.push(encryptionScheme);
  }

  return accepted;
}

/**
 * Which codecs decode *under* this key system, and how far up the resolution
 * ladder they get.
 *
 * `requestMediaKeySystemAccess` only answers "will the CDM accept this content
 * type" — it ignores width/height entirely. `decodingInfo` with a
 * `keySystemConfiguration` answers the question people actually have: whether
 * 4K HEVC will play under this DRM, and whether it will play smoothly.
 */
async function probeEncryptedCodecs(
  keySystem: string,
  robustness: string | undefined,
): Promise<EncryptedCodecSupport[]> {
  // FairPlay rejects `cenc` here for the same reason it does in EME.
  const initDataType = keySystem.startsWith('com.apple.fps')
    ? FAIRPLAY_INIT_DATA_TYPE
    : 'cenc';

  const keySystemConfiguration: DecodingKeySystemConfiguration = {
    keySystem,
    initDataType,
    ...(robustness ? { video: { robustness } } : {}),
  };

  const results: EncryptedCodecSupport[] = [];

  for (const codec of DRM_PROBE_CODECS) {
    const base = await probeDecodingInfo(
      {
        type: 'media-source',
        video: {
          contentType: codec.mimeType,
          width: 1920,
          height: 1080,
          bitrate: 6_000_000,
          framerate: 30,
        },
        keySystemConfiguration,
      },
      null,
      `${codec.name} under ${keySystem}`,
    );

    if (!base.supported) {
      results.push({ ...codec, supported: false });
      continue;
    }

    // Only ladder codecs that already work — the rungs are the expensive part.
    let maxResolution: string | undefined;
    for (const rung of RESOLUTION_LADDER) {
      const { supported } = await probeDecodingInfo(
        {
          type: 'media-source',
          video: {
            contentType: codec.mimeType,
            width: rung.width,
            height: rung.height,
            bitrate: rung.bitrate,
            framerate: 30,
          },
          keySystemConfiguration,
        },
        null,
        `${codec.name} at ${rung.name} under ${keySystem}`,
      );
      if (supported) maxResolution = rung.name;
    }

    results.push({
      ...codec,
      supported: true,
      smooth: base.smooth,
      powerEfficient: base.powerEfficient,
      maxResolution,
    });
  }

  return results;
}

/**
 * Ask for persistent-license and distinctive-identifier explicitly, then read
 * back what the CDM negotiated. A CDM that does not support a `required`
 * feature rejects the request outright.
 */
async function probeSessionFeatures(
  keySystem: string,
): Promise<{ persistentLicense: boolean; distinctiveIdentifier: boolean }> {
  const persistentAccess = await requestKeySystemAccess(keySystem, {
    initDataTypes: INIT_DATA_TYPES,
    persistentState: 'required',
    sessionTypes: ['persistent-license'],
    videoCapabilities: [...BASE_VIDEO_CAPABILITIES],
    audioCapabilities: [...BASE_AUDIO_CAPABILITIES],
  });

  const sessionTypes = persistentAccess?.getConfiguration().sessionTypes;

  const distinctiveIdentifier = await probeKeySystem(keySystem, {
    initDataTypes: INIT_DATA_TYPES,
    distinctiveIdentifier: 'required',
    videoCapabilities: [...BASE_VIDEO_CAPABILITIES],
  });

  return {
    // Some CDMs grant access but silently drop the session type, so trust the
    // negotiated configuration over the fact that the request resolved.
    persistentLicense: sessionTypes ? sessionTypes.includes('persistent-license') : false,
    distinctiveIdentifier,
  };
}

function securityLevelFor(
  family: DRMFamily,
  keySystem: string,
  videoRobustness: string[],
): string {
  if (family.name === 'Widevine') {
    const best = videoRobustness[0];
    return best ? (WIDEVINE_SECURITY_LEVELS[best] ?? best) : 'L3 (Software)';
  }

  if (family.name === 'PlayReady') {
    // The key system string itself encodes hardware DRM when it ends in 3000.
    if (keySystem.includes('3000')) return PLAYREADY_SECURITY_LEVELS['3000'];
    if (keySystem.endsWith('.hardware')) return 'SL3000 (Hardware)';
    const best = videoRobustness[0];
    return best ? (PLAYREADY_SECURITY_LEVELS[best] ?? best) : 'SL2000 (Software)';
  }

  // FairPlay is hardware-backed by design and exposes no robustness strings.
  if (family.name === 'FairPlay') return 'Hardware (Apple FairPlay)';
  if (family.name === 'ClearKey') return 'None (test key system)';

  return 'Not exposed';
}

function unsupportedFamily(family: DRMFamily, keySystems: KeySystemResult[]): DRMSystemInfo {
  return {
    name: family.name,
    keySystem: family.variants[0].keySystem,
    icon: family.icon,
    supported: false,
    keySystems,
    securityLevel: 'Not Supported',
    videoRobustness: [],
    audioRobustness: [],
    encryptionSchemes: [],
    hdcpVersions: [],
    persistentLicenseSupport: false,
    distinctiveIdentifier: false,
    supportedCodecs: [],
    supportedAudioCodecs: [],
    encryptedDecodingQueried: false,
    hdrCapabilities: [],
  };
}

/**
 * Probes every known key system via EME.
 *
 * `hdrFormats` is passed in rather than detected here so this module stays
 * independent of codec detection; a DRM system is reported as HDR-capable if
 * the browser can decode that format at all.
 */
export async function detectDRMSystems(hdrFormats: HDRCapability[]): Promise<DRMSystemInfo[]> {
  if (!navigator.requestMediaKeySystemAccess) return [];

  const supportedHdr = hdrFormats.filter((h) => h.supported);
  const results: DRMSystemInfo[] = [];

  for (const family of DRM_FAMILIES) {
    const { keySystems, active } = await resolveFamily(family);

    if (!active) {
      results.push(unsupportedFamily(family, keySystems));
      continue;
    }

    const { keySystem, access } = active;
    const videoRobustness = await probeRobustness(keySystem, family.robustness, 'video');
    const audioRobustness = await probeRobustness(keySystem, family.robustness, 'audio');
    const { persistentLicense, distinctiveIdentifier } = await probeSessionFeatures(keySystem);

    results.push({
      name: family.name,
      keySystem,
      icon: family.icon,
      supported: true,
      keySystems,
      securityLevel: securityLevelFor(family, keySystem, videoRobustness),
      videoRobustness,
      audioRobustness,
      encryptionSchemes: await probeEncryptionSchemes(keySystem),
      hdcpVersions: await probeHdcpVersions(access, HDCP_VERSIONS),
      persistentLicenseSupport: persistentLicense,
      distinctiveIdentifier,
      supportedCodecs: await probeEncryptedCodecs(keySystem, videoRobustness[0]),
      supportedAudioCodecs: [],
      encryptedDecodingQueried: 'mediaCapabilities' in navigator,
      hdrCapabilities: supportedHdr,
    });
  }

  return results;
}
