import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectDRMSystems } from './drmDetector';
import type { HDRCapability } from '../types/drm';

/**
 * A simulated CDM.
 *
 * Real EME support cannot be exercised in CI, but the rules a CDM enforces
 * are simple enough to model faithfully: reject when no offered initDataType
 * is supported, when no capability matches, or when a `required` feature is
 * unavailable. That is enough to catch the mistakes that actually happen.
 */
interface KeySystemRules {
  initDataTypes: string[];
  contentTypes: string[];
  robustness: string[];
  schemes: string[];
  persistent: boolean;
  distinctiveId: boolean;
}

interface Platform {
  keySystems: Record<string, KeySystemRules>;
  /** Codec content-type prefixes decodingInfo will accept. */
  decodable?: string[];
}

const MP4 = ['video/mp4', 'audio/mp4'];
const WEBM = ['video/webm', 'audio/webm'];

const clearKey: KeySystemRules = {
  initDataTypes: ['cenc', 'keyids'],
  contentTypes: [...MP4, ...WEBM],
  robustness: [''],
  schemes: ['cenc', 'cbcs'],
  persistent: false,
  distinctiveId: false,
};

const widevine = (robustness: string[]): KeySystemRules => ({
  initDataTypes: ['cenc', 'keyids'],
  contentTypes: [...MP4, ...WEBM],
  robustness: ['', ...robustness],
  schemes: ['cenc', 'cbcs'],
  persistent: true,
  distinctiveId: true,
});

/** FairPlay: MP4 only, cbcs only, and it rejects `cenc` init data outright. */
const fairplay: KeySystemRules = {
  initDataTypes: ['sinf', 'skd'],
  contentTypes: MP4,
  robustness: [''],
  schemes: ['cbcs'],
  persistent: false,
  distinctiveId: true,
};

interface FakeCapability {
  contentType: string;
  robustness?: string;
  encryptionScheme?: string;
}

function install(platform: Platform) {
  const matches = (rules: KeySystemRules, caps: FakeCapability[] | undefined) =>
    (caps ?? []).filter((c) => rules.contentTypes.some((t) => c.contentType.startsWith(t)));

  vi.stubGlobal('navigator', {
    async requestMediaKeySystemAccess(
      keySystem: string,
      configs: Record<string, unknown>[],
    ) {
      const rules = platform.keySystems[keySystem];
      if (!rules) throw new Error('unsupported key system');

      const cfg = configs[0] as {
        initDataTypes?: string[];
        videoCapabilities?: FakeCapability[];
        audioCapabilities?: FakeCapability[];
        persistentState?: string;
        distinctiveIdentifier?: string;
        sessionTypes?: string[];
      };

      const initDataTypes = (cfg.initDataTypes ?? []).filter((t) =>
        rules.initDataTypes.includes(t),
      );
      if ((cfg.initDataTypes ?? []).length > 0 && initDataTypes.length === 0) {
        throw new Error('unsupported initDataType');
      }

      const check = (caps: FakeCapability[] | undefined) => {
        const usable = matches(rules, caps).filter(
          (c) =>
            (!c.robustness || rules.robustness.includes(c.robustness)) &&
            (!c.encryptionScheme || rules.schemes.includes(c.encryptionScheme)),
        );
        if ((caps ?? []).length > 0 && usable.length === 0) throw new Error('no capabilities');
        return usable;
      };

      const videoCapabilities = check(cfg.videoCapabilities);
      const audioCapabilities = check(cfg.audioCapabilities);

      if (cfg.distinctiveIdentifier === 'required' && !rules.distinctiveId) {
        throw new Error('no distinctive identifier');
      }
      if (cfg.persistentState === 'required' && !rules.persistent) {
        throw new Error('no persistent state');
      }

      return {
        keySystem,
        getConfiguration: () => ({
          initDataTypes,
          videoCapabilities,
          audioCapabilities,
          sessionTypes: rules.persistent ? (cfg.sessionTypes ?? ['temporary']) : ['temporary'],
        }),
        createMediaKeys: async () => {
          throw new Error('no media keys in test');
        },
      };
    },

    mediaCapabilities: {
      async decodingInfo(cfg: { video?: { contentType: string } }) {
        const ct = cfg.video?.contentType ?? '';
        const ok = (platform.decodable ?? ['video/mp4', 'video/webm']).some((p) =>
          ct.startsWith(p),
        );
        return { supported: ok, smooth: ok, powerEfficient: ok, keySystemAccess: null };
      },
    },
  });
}

const HDR: HDRCapability[] = [
  { name: 'HDR10', supported: true, description: '', transferFunction: 'pq' },
];

const find = (results: Awaited<ReturnType<typeof detectDRMSystems>>, name: string) =>
  results.find((r) => r.name === name);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FairPlay on Apple platforms', () => {
  const applePlatform: Platform = {
    keySystems: { 'org.w3.clearkey': clearKey, 'com.apple.fps': fairplay },
    decodable: ['video/mp4'],
  };

  /**
   * Regression: the detector originally probed every key system with
   * `initDataTypes: ['cenc']`. FairPlay rejects `cenc`, so Safari on macOS,
   * iOS and iPadOS reported no DRM whatsoever.
   */
  it('detects FairPlay, which requires sinf/skd rather than cenc', async () => {
    install(applePlatform);
    const fps = find(await detectDRMSystems(HDR), 'FairPlay');

    expect(fps?.supported).toBe(true);
    expect(fps?.keySystem).toBe('com.apple.fps');
  });

  it('reports cbcs and not cenc, matching FairPlay reality', async () => {
    install(applePlatform);
    const fps = find(await detectDRMSystems(HDR), 'FairPlay');

    expect(fps?.encryptionSchemes).toEqual(['cbcs']);
  });

  it('does not report Widevine or PlayReady on an Apple platform', async () => {
    install(applePlatform);
    const results = await detectDRMSystems(HDR);

    expect(find(results, 'Widevine')?.supported).toBe(false);
    expect(find(results, 'PlayReady')?.supported).toBe(false);
  });
});

describe('Widevine security levels', () => {
  it('reports L1 when hardware robustness is accepted', async () => {
    install({ keySystems: { 'com.widevine.alpha': widevine(['HW_SECURE_ALL', 'HW_SECURE_DECODE']) } });
    expect(find(await detectDRMSystems(HDR), 'Widevine')?.securityLevel).toBe('L1 (Hardware)');
  });

  // Regression: the original code treated anything below HW_SECURE_ALL as L3,
  // so L2 devices were mislabelled.
  it('distinguishes L2 from L3', async () => {
    install({ keySystems: { 'com.widevine.alpha': widevine(['HW_SECURE_CRYPTO']) } });
    expect(find(await detectDRMSystems(HDR), 'Widevine')?.securityLevel).toBe('L2 (Hybrid)');
  });

  it('reports L3 for software-only robustness', async () => {
    install({ keySystems: { 'com.widevine.alpha': widevine(['SW_SECURE_DECODE']) } });
    expect(find(await detectDRMSystems(HDR), 'Widevine')?.securityLevel).toBe('L3 (Software)');
  });
});

describe('PlayReady key system variants', () => {
  const playready = (robustness: string[]): KeySystemRules => ({
    initDataTypes: ['cenc', 'keyids'],
    contentTypes: MP4,
    robustness: ['', ...robustness],
    schemes: ['cenc', 'cbcs'],
    persistent: true,
    distinctiveId: true,
  });

  /**
   * `com.microsoft.playready` succeeds nearly everywhere on Windows, so only
   * walking the `.recommendation.3000` string reveals hardware DRM.
   */
  it('prefers the SL3000 key system when available', async () => {
    install({
      keySystems: {
        'com.microsoft.playready': playready(['2000']),
        'com.microsoft.playready.recommendation': playready(['2000', '3000']),
        'com.microsoft.playready.recommendation.3000': playready(['3000']),
      },
    });

    const pr = find(await detectDRMSystems(HDR), 'PlayReady');
    expect(pr?.keySystem).toBe('com.microsoft.playready.recommendation.3000');
    expect(pr?.securityLevel).toBe('SL3000 (Hardware)');
  });

  it('falls back to the base key system and reports software level', async () => {
    install({ keySystems: { 'com.microsoft.playready': playready(['2000']) } });

    const pr = find(await detectDRMSystems(HDR), 'PlayReady');
    expect(pr?.keySystem).toBe('com.microsoft.playready');
    expect(pr?.securityLevel).toBe('SL2000 (Software)');
  });

  it('records every variant it probed, not just the winner', async () => {
    install({ keySystems: { 'com.microsoft.playready': playready(['2000']) } });

    const pr = find(await detectDRMSystems(HDR), 'PlayReady');
    expect(pr?.keySystems).toHaveLength(4);
    expect(pr?.keySystems.filter((k) => k.supported)).toHaveLength(1);
  });
});

describe('session features', () => {
  it('reports persistent-license from the negotiated configuration', async () => {
    install({ keySystems: { 'com.widevine.alpha': widevine(['SW_SECURE_DECODE']) } });
    const wv = find(await detectDRMSystems(HDR), 'Widevine');

    expect(wv?.persistentLicenseSupport).toBe(true);
    expect(wv?.distinctiveIdentifier).toBe(true);
  });

  it('reports no persistent license when the CDM refuses it', async () => {
    install({ keySystems: { 'com.apple.fps': fairplay } });
    expect(find(await detectDRMSystems(HDR), 'FairPlay')?.persistentLicenseSupport).toBe(false);
  });
});

it('returns an empty list when EME is unavailable', async () => {
  vi.stubGlobal('navigator', {});
  expect(await detectDRMSystems(HDR)).toEqual([]);
});

it('marks every family unsupported rather than throwing on a bare CDM', async () => {
  install({ keySystems: {} });
  const results = await detectDRMSystems(HDR);

  expect(results).toHaveLength(5);
  expect(results.every((r) => !r.supported)).toBe(true);
});
