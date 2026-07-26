import type { WebCodecsSupport } from '../types/drm';
import { WEBCODECS_AUDIO, WEBCODECS_VIDEO } from '../constants/codecs';

/**
 * WebCodecs support probing.
 *
 * This is a separate code path from Media Capabilities and can disagree with
 * it — a browser may play a codec through a <video> element while exposing no
 * WebCodecs decoder for it (Safari shipped VideoDecoder well before
 * AudioDecoder). Worth reporting independently rather than inferring.
 */

interface ConfigSupport {
  supported?: boolean;
}

interface CodecStatic {
  isConfigSupported: (config: object) => Promise<ConfigSupport>;
}

function codecClass(name: string): CodecStatic | null {
  const ctor = (globalThis as Record<string, unknown>)[name] as CodecStatic | undefined;
  return ctor && typeof ctor.isConfigSupported === 'function' ? ctor : null;
}

async function supports(name: string, config: object): Promise<boolean> {
  const ctor = codecClass(name);
  if (!ctor) return false;

  try {
    const result = await ctor.isConfigSupported(config);
    return result.supported === true;
  } catch {
    // isConfigSupported throws TypeError on configs it cannot even parse.
    return false;
  }
}

async function names<T extends { name: string }>(
  entries: T[],
  test: (entry: T) => Promise<boolean>,
): Promise<string[]> {
  const results = await Promise.all(entries.map(async (e) => ((await test(e)) ? e.name : null)));
  return results.filter((n): n is string => n !== null);
}

export async function detectWebCodecs(): Promise<WebCodecsSupport> {
  const available = codecClass('VideoDecoder') !== null || codecClass('AudioDecoder') !== null;

  if (!available) {
    return { available: false, videoDecode: [], videoEncode: [], audioDecode: [], audioEncode: [] };
  }

  const [videoDecode, videoEncode, audioDecode, audioEncode] = await Promise.all([
    names(WEBCODECS_VIDEO, (v) =>
      supports('VideoDecoder', { codec: v.codec, codedWidth: 1920, codedHeight: 1080 }),
    ),
    names(WEBCODECS_VIDEO, (v) =>
      supports('VideoEncoder', {
        codec: v.codec,
        width: 1920,
        height: 1080,
        bitrate: 2_000_000,
        framerate: 30,
      }),
    ),
    names(WEBCODECS_AUDIO, (a) =>
      supports('AudioDecoder', { codec: a.codec, sampleRate: 48000, numberOfChannels: 2 }),
    ),
    names(WEBCODECS_AUDIO, (a) =>
      supports('AudioEncoder', {
        codec: a.codec,
        sampleRate: 48000,
        numberOfChannels: 2,
        bitrate: 128000,
      }),
    ),
  ]);

  return { available: true, videoDecode, videoEncode, audioDecode, audioEncode };
}
