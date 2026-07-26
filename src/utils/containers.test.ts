import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectContainers } from './containers';

interface FakeEnv {
  mse?: RegExp;
  play?: (type: string) => string;
  record?: RegExp;
}

function install({ mse, play, record }: FakeEnv) {
  vi.stubGlobal('MediaSource', mse ? { isTypeSupported: (t: string) => mse.test(t) } : undefined);
  vi.stubGlobal(
    'MediaRecorder',
    record ? { isTypeSupported: (t: string) => record.test(t) } : undefined,
  );
  vi.stubGlobal('document', {
    createElement: () => ({ canPlayType: (t: string) => play?.(t) ?? '' }),
  });
}

const find = (name: string) => detectContainers().find((c) => c.name === name);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('container detection', () => {
  it('reports the three APIs independently', () => {
    install({
      mse: /video\/webm/,
      play: (t) => (/video\/webm/.test(t) ? 'probably' : ''),
      record: /video\/webm/,
    });

    expect(find('WebM')).toMatchObject({
      mediaSource: true,
      progressive: 'probably',
      recording: true,
    });
  });

  /**
   * Safari plays HLS directly but cannot feed it to MediaSource, and records
   * neither — flattening the three answers into one boolean would lose that.
   */
  it('separates direct playback from MSE, as Safari does for HLS', () => {
    install({ mse: /^$/, play: (t) => (/mpegurl/.test(t) ? 'maybe' : ''), record: /^$/ });

    expect(find('HLS')).toMatchObject({
      mediaSource: false,
      progressive: 'maybe',
      recording: false,
    });
  });

  it("preserves canPlayType's probably/maybe distinction", () => {
    install({ play: (t) => (/mp4/.test(t) ? 'maybe' : 'probably') });

    expect(find('MP4 / CMAF')?.progressive).toBe('maybe');
    expect(find('WebM')?.progressive).toBe('probably');
  });

  it('never probes MSE for playlist formats, which are element-only', () => {
    // A permissive MediaSource must not make DASH look MSE-capable.
    install({ mse: /.*/ });

    expect(find('HLS')?.mediaSource).toBe(false);
    expect(find('MPEG-DASH')?.mediaSource).toBe(false);
  });
});

describe('degradation', () => {
  it('reports no support rather than throwing when the APIs are absent', () => {
    install({});
    const containers = detectContainers();

    expect(containers.length).toBeGreaterThan(0);
    expect(containers.every((c) => !c.mediaSource && !c.recording)).toBe(true);
  });

  it('survives an API that throws', () => {
    vi.stubGlobal('MediaSource', {
      isTypeSupported: () => {
        throw new TypeError('bad type');
      },
    });
    vi.stubGlobal('MediaRecorder', undefined);
    vi.stubGlobal('document', {
      createElement: () => ({
        canPlayType: () => {
          throw new Error('nope');
        },
      }),
    });

    expect(() => detectContainers()).not.toThrow();
    expect(detectContainers().every((c) => !c.mediaSource && c.progressive === '')).toBe(true);
  });
});
