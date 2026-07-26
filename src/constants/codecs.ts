/**
 * Codec and HDR test vectors.
 *
 * These strings are the app's measurement instrument — a typo here silently
 * changes what users are told their browser supports. Syntax follows RFC 6381
 * as documented by MDN's codecs-parameter guide, with four-character codes from
 * the MP4 Registration Authority.
 *
 * Codecs are grouped into families. Detail probes (playback mode, alpha, HDR
 * metadata, channel layouts) run once per family rather than per variant —
 * otherwise the probe count runs into the hundreds for no extra information.
 */

export interface VideoCodecProbe {
  name: string;
  mimeType: string;
  family: string;
  profile?: string;
}

export interface AudioCodecProbe {
  name: string;
  mimeType: string;
  family: string;
}

const mp4 = (codec: string) => `video/mp4;codecs="${codec}"`;
const webm = (codec: string) => `video/webm;codecs="${codec}"`;
const m4a = (codec: string) => `audio/mp4;codecs="${codec}"`;

export const VIDEO_CODECS_TO_TEST: VideoCodecProbe[] = [
  // ── H.264 / AVC ────────────────────────────────────────────────────────
  // avc1.PPCCLL — profile, constraint flags, level (all hex).
  { family: 'H.264 / AVC', name: 'Baseline L3.0', mimeType: mp4('avc1.42E01E'), profile: 'Baseline' },
  { family: 'H.264 / AVC', name: 'Main L3.0', mimeType: mp4('avc1.4D401E'), profile: 'Main' },
  { family: 'H.264 / AVC', name: 'Main L4.0', mimeType: mp4('avc1.4D4028'), profile: 'Main' },
  { family: 'H.264 / AVC', name: 'High L4.0', mimeType: mp4('avc1.640028'), profile: 'High' },
  { family: 'H.264 / AVC', name: 'High L4.1', mimeType: mp4('avc1.640029'), profile: 'High' },
  { family: 'H.264 / AVC', name: 'High L5.1', mimeType: mp4('avc1.640033'), profile: 'High' },
  { family: 'H.264 / AVC', name: 'High L5.2', mimeType: mp4('avc1.640034'), profile: 'High' },
  { family: 'H.264 / AVC', name: 'High 10 (Hi10P)', mimeType: mp4('avc1.6E0028'), profile: 'High 10' },
  { family: 'H.264 / AVC', name: 'High 4:2:2', mimeType: mp4('avc1.7A0028'), profile: 'High 4:2:2' },
  { family: 'H.264 / AVC', name: 'High 4:4:4 Predictive', mimeType: mp4('avc1.F40028'), profile: 'High 4:4:4' },
  // avc3 signals parameter sets in-band; MSE players care about the difference.
  { family: 'H.264 / AVC', name: 'In-band params (avc3)', mimeType: mp4('avc3.42E01E'), profile: 'Baseline' },

  // ── HEVC / H.265 ───────────────────────────────────────────────────────
  // hvc1.Profile.Compat.Tier+Level.Constraints — level is idc = level × 30.
  { family: 'HEVC / H.265', name: 'Main L3.1', mimeType: mp4('hvc1.1.6.L93.B0'), profile: 'Main' },
  { family: 'HEVC / H.265', name: 'Main L4.1', mimeType: mp4('hvc1.1.6.L123.B0'), profile: 'Main' },
  { family: 'HEVC / H.265', name: 'Main L5.1', mimeType: mp4('hvc1.1.6.L153.B0'), profile: 'Main' },
  { family: 'HEVC / H.265', name: 'Main 10 L5.1', mimeType: mp4('hvc1.2.4.L153.B0'), profile: 'Main 10' },
  { family: 'HEVC / H.265', name: 'Main 10 L6.1', mimeType: mp4('hvc1.2.4.L183.B0'), profile: 'Main 10' },
  { family: 'HEVC / H.265', name: 'Main Still Picture', mimeType: mp4('hvc1.3.E.L120.B0'), profile: 'Main Still' },
  { family: 'HEVC / H.265', name: 'Range Extensions', mimeType: mp4('hvc1.4.10.L120.B0'), profile: 'RExt' },
  { family: 'HEVC / H.265', name: 'In-band params (hev1)', mimeType: mp4('hev1.1.6.L93.B0'), profile: 'Main' },
  { family: 'HEVC / H.265', name: 'Main 10 in-band (hev1)', mimeType: mp4('hev1.2.4.L153.B0'), profile: 'Main 10' },

  // ── VP9 ────────────────────────────────────────────────────────────────
  // vp09.Profile.Level.BitDepth[.Chroma.Primaries.Transfer.Matrix.Range]
  { family: 'VP9', name: 'Profile 0 (8-bit)', mimeType: webm('vp9'), profile: 'Profile 0' },
  { family: 'VP9', name: 'Profile 0 L4.1', mimeType: webm('vp09.00.41.08'), profile: 'Profile 0' },
  { family: 'VP9', name: 'Profile 0 L5.1', mimeType: webm('vp09.00.51.08'), profile: 'Profile 0' },
  { family: 'VP9', name: 'Profile 1 (4:2:2/4:4:4)', mimeType: webm('vp09.01.20.08'), profile: 'Profile 1' },
  { family: 'VP9', name: 'Profile 2 (10-bit)', mimeType: webm('vp09.02.10.10'), profile: 'Profile 2' },
  { family: 'VP9', name: 'Profile 2 HDR (BT.2020 PQ)', mimeType: webm('vp09.02.10.10.01.09.16.09.01'), profile: 'Profile 2' },
  { family: 'VP9', name: 'Profile 3 (12-bit)', mimeType: webm('vp09.03.10.12'), profile: 'Profile 3' },
  { family: 'VP9', name: 'In MP4 container', mimeType: mp4('vp09.00.10.08'), profile: 'Profile 0' },

  // ── AV1 ────────────────────────────────────────────────────────────────
  // av01.Profile.LevelTier.BitDepth — level X.Y where X = 2+(L>>2), Y = L&3.
  { family: 'AV1', name: 'Main L3.0 (8-bit)', mimeType: mp4('av01.0.04M.08'), profile: 'Main' },
  { family: 'AV1', name: 'Main L4.0 (8-bit)', mimeType: mp4('av01.0.08M.08'), profile: 'Main' },
  { family: 'AV1', name: 'Main L5.0 (10-bit)', mimeType: mp4('av01.0.12M.10'), profile: 'Main' },
  { family: 'AV1', name: 'Main L5.1 HDR', mimeType: mp4('av01.0.13M.10.0.110.09.16.09.0'), profile: 'Main' },
  { family: 'AV1', name: 'Main L6.0 (10-bit)', mimeType: mp4('av01.0.16M.10'), profile: 'Main' },
  { family: 'AV1', name: 'High (4:4:4)', mimeType: mp4('av01.1.08M.08'), profile: 'High' },
  { family: 'AV1', name: 'Professional (12-bit)', mimeType: mp4('av01.2.08M.12'), profile: 'Professional' },
  { family: 'AV1', name: 'In WebM container', mimeType: webm('av01.0.04M.08'), profile: 'Main' },

  // ── Dolby Vision ───────────────────────────────────────────────────────
  // dvXX.Profile.Level — dvh1/dvhe are HEVC-based, dvav/dva1 AVC, dav1 AV1.
  { family: 'Dolby Vision', name: 'Profile 5 (dvh1)', mimeType: mp4('dvh1.05.06'), profile: 'Profile 5' },
  { family: 'Dolby Vision', name: 'Profile 5 (dvhe)', mimeType: mp4('dvhe.05.06'), profile: 'Profile 5' },
  { family: 'Dolby Vision', name: 'Profile 8.1 (HDR10 compatible)', mimeType: mp4('dvh1.08.06'), profile: 'Profile 8.1' },
  { family: 'Dolby Vision', name: 'Profile 8.4 (HLG compatible)', mimeType: mp4('dvhe.08.09'), profile: 'Profile 8.4' },
  { family: 'Dolby Vision', name: 'Profile 9 (AVC-based)', mimeType: mp4('dvav.09.01'), profile: 'Profile 9' },
  { family: 'Dolby Vision', name: 'Profile 10 (AV1-based)', mimeType: mp4('dav1.10.06'), profile: 'Profile 10' },

  // ── Newer and legacy ───────────────────────────────────────────────────
  { family: 'VVC / H.266', name: 'Main 10', mimeType: mp4('vvc1.1.L67.CQA'), profile: 'Main 10' },
  { family: 'VVC / H.266', name: 'In-band params (vvi1)', mimeType: mp4('vvi1.1.L67.CQA'), profile: 'Main 10' },
  { family: 'VP8', name: 'VP8', mimeType: webm('vp8'), profile: 'Standard' },
  { family: 'Theora', name: 'Theora', mimeType: 'video/ogg;codecs="theora"', profile: 'Standard' },
  { family: 'MPEG-4 Visual', name: 'Simple Profile', mimeType: mp4('mp4v.20.9'), profile: 'Simple' },
  { family: 'MPEG-4 Visual', name: 'Advanced Simple', mimeType: mp4('mp4v.20.240'), profile: 'Advanced Simple' },
  { family: 'MPEG-2 Video', name: 'Main Profile', mimeType: 'video/mp2t;codecs="mp2v"', profile: 'Main' },
];

export const AUDIO_CODECS_TO_TEST: AudioCodecProbe[] = [
  // ── AAC family ─────────────────────────────────────────────────────────
  // mp4a.40.N — N is the MPEG-4 Audio Object Type.
  { family: 'AAC', name: 'AAC-LC', mimeType: m4a('mp4a.40.2') },
  { family: 'AAC', name: 'HE-AAC v1 (SBR)', mimeType: m4a('mp4a.40.5') },
  { family: 'AAC', name: 'HE-AAC v2 (PS)', mimeType: m4a('mp4a.40.29') },
  { family: 'AAC', name: 'AAC-LD (Low Delay)', mimeType: m4a('mp4a.40.23') },
  { family: 'AAC', name: 'AAC-ELD (Enhanced Low Delay)', mimeType: m4a('mp4a.40.39') },
  { family: 'AAC', name: 'xHE-AAC (USAC)', mimeType: m4a('mp4a.40.42') },
  { family: 'AAC', name: 'AAC Main', mimeType: m4a('mp4a.40.1') },
  { family: 'AAC', name: 'AAC-LTP', mimeType: m4a('mp4a.40.4') },
  { family: 'AAC', name: 'ADTS stream', mimeType: 'audio/aac' },

  // ── MPEG audio ─────────────────────────────────────────────────────────
  { family: 'MPEG Audio', name: 'MP3', mimeType: 'audio/mpeg' },
  { family: 'MPEG Audio', name: 'MP3 in MP4', mimeType: m4a('mp4a.40.34') },
  { family: 'MPEG Audio', name: 'MP3 (OTI 0x69)', mimeType: m4a('mp4a.69') },
  { family: 'MPEG Audio', name: 'MP2', mimeType: m4a('mp4a.40.33') },

  // ── Dolby ──────────────────────────────────────────────────────────────
  { family: 'Dolby', name: 'AC-3 (Dolby Digital)', mimeType: m4a('ac-3') },
  { family: 'Dolby', name: 'E-AC-3 (Dolby Digital Plus)', mimeType: m4a('ec-3') },
  { family: 'Dolby', name: 'AC-4', mimeType: m4a('ac-4') },
  { family: 'Dolby', name: 'TrueHD (MLP)', mimeType: m4a('mlpa') },

  // ── DTS ────────────────────────────────────────────────────────────────
  { family: 'DTS', name: 'DTS Core', mimeType: m4a('dtsc') },
  { family: 'DTS', name: 'DTS Express (LBR)', mimeType: m4a('dtse') },
  { family: 'DTS', name: 'DTS-HD High Resolution', mimeType: m4a('dtsh') },
  { family: 'DTS', name: 'DTS-HD Lossless (MA)', mimeType: m4a('dtsl') },
  { family: 'DTS', name: 'DTS:X', mimeType: m4a('dtsx') },

  // ── MPEG-H 3D Audio ────────────────────────────────────────────────────
  { family: 'MPEG-H 3D Audio', name: 'MHAS (mhm1)', mimeType: m4a('mhm1') },
  { family: 'MPEG-H 3D Audio', name: 'MHAS multi-stream (mhm2)', mimeType: m4a('mhm2') },
  { family: 'MPEG-H 3D Audio', name: 'Raw (mha1)', mimeType: m4a('mha1') },

  // ── Open / lossless ────────────────────────────────────────────────────
  { family: 'Opus', name: 'Opus in Ogg', mimeType: 'audio/ogg;codecs="opus"' },
  { family: 'Opus', name: 'Opus in WebM', mimeType: 'audio/webm;codecs="opus"' },
  { family: 'Opus', name: 'Opus in MP4', mimeType: m4a('opus') },
  { family: 'Vorbis', name: 'Vorbis in Ogg', mimeType: 'audio/ogg;codecs="vorbis"' },
  { family: 'Vorbis', name: 'Vorbis in WebM', mimeType: 'audio/webm;codecs="vorbis"' },
  { family: 'FLAC', name: 'FLAC (native)', mimeType: 'audio/flac' },
  { family: 'FLAC', name: 'FLAC in MP4', mimeType: m4a('flac') },
  { family: 'FLAC', name: 'FLAC in Ogg', mimeType: 'audio/ogg;codecs="flac"' },
  { family: 'ALAC', name: 'Apple Lossless', mimeType: m4a('alac') },

  // ── Uncompressed and speech ────────────────────────────────────────────
  { family: 'PCM', name: 'WAV (16-bit PCM)', mimeType: 'audio/wav;codecs="1"' },
  { family: 'PCM', name: 'PCM in MP4 (lpcm)', mimeType: m4a('lpcm') },
  { family: 'PCM', name: 'PCM little-endian (sowt)', mimeType: m4a('sowt') },
  { family: 'Speech', name: 'AMR Narrowband', mimeType: m4a('samr') },
  { family: 'Speech', name: 'AMR Wideband', mimeType: m4a('sawb') },
  { family: 'Speech', name: 'Speex', mimeType: 'audio/ogg;codecs="speex"' },

  // ── Immersive ──────────────────────────────────────────────────────────
  { family: 'IAMF', name: 'Immersive Audio (AOM)', mimeType: m4a('iamf') },
];

/**
 * `decodingInfo` answers differently per playback mode: `file` is progressive
 * playback, `media-source` is MSE (what every streaming player uses), and
 * `webrtc` is realtime. A codec can be available in one and absent in another.
 */
export const PLAYBACK_MODES = ['file', 'media-source', 'webrtc'] as const;
export type PlaybackMode = (typeof PLAYBACK_MODES)[number];

/** HDR static/dynamic metadata formats, per the Media Capabilities IDL. */
export const HDR_METADATA_TYPES = [
  { id: 'smpteSt2086', label: 'SMPTE ST 2086 (HDR10 static)' },
  { id: 'smpteSt2094-10', label: 'SMPTE ST 2094-10 (Dolby Vision)' },
  { id: 'smpteSt2094-40', label: 'SMPTE ST 2094-40 (HDR10+)' },
] as const;

export const COLOR_GAMUTS = ['srgb', 'p3', 'rec2020'] as const;
export const TRANSFER_FUNCTIONS = ['srgb', 'pq', 'hlg'] as const;

/** Channel layouts to probe, as the IDL's DOMString form. */
export const CHANNEL_LAYOUTS = [
  { channels: '2', label: 'Stereo' },
  { channels: '6', label: '5.1 Surround' },
  { channels: '8', label: '7.1 Surround' },
  { channels: '12', label: '7.1.4 Immersive' },
] as const;

/**
 * Resolution rungs, with bitrates typical of streaming services at each.
 *
 * `decodingInfo` genuinely honours width/height/bitrate/framerate — unlike EME
 * capability objects, where those members are undefined and silently ignored.
 * This is therefore a real measurement, and `smooth` distinguishes "will decode"
 * from "will decode without dropping frames".
 */
export const RESOLUTION_LADDER = [
  { name: '480p', width: 854, height: 480, bitrate: 1_500_000 },
  { name: '720p', width: 1280, height: 720, bitrate: 3_000_000 },
  { name: '1080p', width: 1920, height: 1080, bitrate: 6_000_000 },
  { name: '1440p', width: 2560, height: 1440, bitrate: 12_000_000 },
  { name: '4K', width: 3840, height: 2160, bitrate: 25_000_000 },
  { name: '8K', width: 7680, height: 4320, bitrate: 80_000_000 },
] as const;

/** Sample decode config shared by every video codec probe. */
export const VIDEO_PROBE_PARAMS = {
  width: 1920,
  height: 1080,
  bitrate: 2646242, // ~2.5Mbps (arbitrary typical value)
  framerate: 60,
} as const;

/** Sample decode config shared by every audio codec probe. */
export const AUDIO_PROBE_PARAMS = {
  channels: '2',
  bitrate: 132300,
  samplerate: 48000,
} as const;

/** Codecs worth asking about for encoding / recording. */
export const ENCODING_CODECS = [
  { name: 'H.264', mimeType: mp4('avc1.42E01E'), kind: 'video' as const },
  { name: 'HEVC', mimeType: mp4('hvc1.1.6.L93.B0'), kind: 'video' as const },
  { name: 'VP8', mimeType: webm('vp8'), kind: 'video' as const },
  { name: 'VP9', mimeType: webm('vp9'), kind: 'video' as const },
  { name: 'AV1', mimeType: mp4('av01.0.05M.08'), kind: 'video' as const },
  { name: 'AAC-LC', mimeType: m4a('mp4a.40.2'), kind: 'audio' as const },
  { name: 'Opus', mimeType: 'audio/webm;codecs="opus"', kind: 'audio' as const },
  { name: 'FLAC', mimeType: 'audio/flac', kind: 'audio' as const },
];

/**
 * WebCodecs uses bare codec strings rather than MIME types, and is a different
 * code path from Media Capabilities — a browser can expose a codec to one and
 * not the other.
 */
export const WEBCODECS_VIDEO = [
  { name: 'H.264', codec: 'avc1.42E01E' },
  { name: 'HEVC', codec: 'hev1.1.6.L93.B0' },
  { name: 'VP8', codec: 'vp8' },
  { name: 'VP9', codec: 'vp09.00.10.08' },
  { name: 'AV1', codec: 'av01.0.04M.08' },
  { name: 'VVC', codec: 'vvc1.1.L67.CQA' },
];

export const WEBCODECS_AUDIO = [
  { name: 'AAC-LC', codec: 'mp4a.40.2' },
  { name: 'MP3', codec: 'mp3' },
  { name: 'Opus', codec: 'opus' },
  { name: 'Vorbis', codec: 'vorbis' },
  { name: 'FLAC', codec: 'flac' },
  { name: 'ALAC', codec: 'alac' },
  { name: 'PCM (f32)', codec: 'pcm-f32' },
  { name: 'µ-law', codec: 'ulaw' },
  { name: 'A-law', codec: 'alaw' },
];

export interface HDRProbe {
  name: string;
  description: string;
  transferFunction?: string;
  config: MediaDecodingConfiguration;
  /**
   * Dolby Vision has no reliable feature query. A P3 display is a weak proxy
   * for a DV-capable device, and gating on it avoids false positives on
   * browsers that accept the `dvhe` string without real support.
   */
  requiresP3Gamut?: boolean;
}

/**
 * Order here is the order reported in the UI and the JSON export.
 */
export const HDR_PROBES: HDRProbe[] = [
  {
    name: 'HDR10',
    description: 'High Dynamic Range 10-bit',
    transferFunction: 'pq',
    config: {
      type: 'media-source',
      video: {
        contentType: mp4('hvc1.2.4.L153.B0'), // HEVC Main 10
        width: 3840,
        height: 2160,
        bitrate: 10000000,
        framerate: 24,
        transferFunction: 'pq',
      },
    },
  },
  {
    name: 'Dolby Vision',
    description: 'Dolby Vision (Proprietary)',
    transferFunction: 'pq',
    requiresP3Gamut: true,
    config: {
      type: 'media-source',
      video: {
        contentType: mp4('dvhe.05.06'),
        width: 1920,
        height: 1080,
        bitrate: 5000000,
        framerate: 24,
      },
    },
  },
  {
    name: 'HLG',
    description: 'Hybrid Log-Gamma',
    transferFunction: 'hlg',
    config: {
      type: 'media-source',
      video: {
        contentType: webm('vp09.02.10.10'), // VP9 Profile 2
        width: 3840,
        height: 2160,
        bitrate: 10000000,
        framerate: 60,
        transferFunction: 'hlg',
      },
    },
  },
  {
    name: 'HDR10+',
    description: 'HDR10+ dynamic metadata',
    transferFunction: 'pq',
    config: {
      type: 'media-source',
      video: {
        contentType: mp4('hvc1.2.4.L153.B0'),
        width: 3840,
        height: 2160,
        bitrate: 10000000,
        framerate: 24,
        transferFunction: 'pq',
        hdrMetadataType: 'smpteSt2094-40',
      },
    } as MediaDecodingConfiguration,
  },
];
