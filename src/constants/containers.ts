/**
 * Container formats, probed through three independent APIs.
 *
 * The three answers genuinely differ: Safari plays HLS progressively but
 * cannot feed it to MediaSource, Chrome does MP4 in MSE but records to WebM
 * only, and MPEG-TS is MSE-only on the platforms that have it at all. A single
 * "is this supported" boolean would hide all of that.
 */
export interface ContainerProbe {
  name: string;
  extensions: string;
  /** Type string for `MediaSource.isTypeSupported` — needs a codecs parameter. */
  mse: string | null;
  /** Type string for `HTMLMediaElement.canPlayType`. */
  progressive: string | null;
  /** Type string for `MediaRecorder.isTypeSupported`. */
  record: string | null;
}

export const CONTAINERS: ContainerProbe[] = [
  {
    name: 'MP4 / CMAF',
    extensions: '.mp4 .m4v',
    mse: 'video/mp4; codecs="avc1.42E01E"',
    progressive: 'video/mp4; codecs="avc1.42E01E"',
    record: 'video/mp4',
  },
  {
    name: 'WebM',
    extensions: '.webm',
    mse: 'video/webm; codecs="vp8"',
    progressive: 'video/webm; codecs="vp8"',
    record: 'video/webm',
  },
  {
    name: 'Matroska',
    extensions: '.mkv',
    mse: 'video/x-matroska; codecs="avc1.42E01E"',
    progressive: 'video/x-matroska',
    record: 'video/x-matroska',
  },
  {
    name: 'MPEG-TS',
    extensions: '.ts .m2ts',
    mse: 'video/mp2t; codecs="avc1.42E01E"',
    progressive: 'video/mp2t',
    record: null,
  },
  {
    name: 'Ogg',
    extensions: '.ogv .ogg',
    mse: 'video/ogg; codecs="theora"',
    progressive: 'video/ogg; codecs="theora"',
    record: null,
  },
  {
    name: 'QuickTime',
    extensions: '.mov',
    mse: null,
    progressive: 'video/quicktime',
    record: null,
  },
  {
    name: '3GPP',
    extensions: '.3gp',
    mse: null,
    progressive: 'video/3gpp',
    record: null,
  },
  {
    name: 'HLS',
    extensions: '.m3u8',
    // Playlists are handed to the element directly, never to MediaSource.
    mse: null,
    progressive: 'application/vnd.apple.mpegurl',
    record: null,
  },
  {
    name: 'MPEG-DASH',
    extensions: '.mpd',
    mse: null,
    progressive: 'application/dash+xml',
    record: null,
  },
  {
    name: 'MP3',
    extensions: '.mp3',
    mse: 'audio/mpeg',
    progressive: 'audio/mpeg',
    record: 'audio/mpeg',
  },
  {
    name: 'AAC (ADTS)',
    extensions: '.aac',
    mse: 'audio/aac',
    progressive: 'audio/aac',
    record: null,
  },
  {
    name: 'MP4 Audio',
    extensions: '.m4a',
    mse: 'audio/mp4; codecs="mp4a.40.2"',
    progressive: 'audio/mp4; codecs="mp4a.40.2"',
    record: 'audio/mp4',
  },
  {
    name: 'Ogg Audio',
    extensions: '.oga .opus',
    mse: 'audio/ogg; codecs="opus"',
    progressive: 'audio/ogg; codecs="opus"',
    record: 'audio/ogg',
  },
  {
    name: 'WAV',
    extensions: '.wav',
    mse: null,
    progressive: 'audio/wav',
    record: null,
  },
  {
    name: 'FLAC',
    extensions: '.flac',
    mse: 'audio/flac',
    progressive: 'audio/flac',
    record: null,
  },
  {
    name: 'CAF',
    extensions: '.caf',
    mse: null,
    progressive: 'audio/x-caf',
    record: null,
  },
];
