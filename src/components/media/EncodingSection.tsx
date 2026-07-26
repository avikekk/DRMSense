import { BsCpu, BsRecordCircle } from 'react-icons/bs';
import type { EncodingSupport, WebCodecsSupport } from '../../types/drm';
import { Chip, Section } from './Section';

function Group({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-gray-600 dark:text-gray-400 w-24 shrink-0">{label}</span>
      {values.length > 0 ? (
        <span className="flex flex-wrap gap-1">
          {values.map((v) => (
            <Chip key={v}>{v}</Chip>
          ))}
        </span>
      ) : (
        <span className="text-gray-400 dark:text-gray-500 text-xs">None</span>
      )}
    </div>
  );
}

/**
 * Recording and realtime encoding, via `encodingInfo`.
 *
 * These two differ in practice — a browser will record VP9 to a file while
 * negotiating H.264 for calls — so they are reported separately.
 */
export function EncodingSection({ encoding }: { encoding: EncodingSupport[] }) {
  const record = encoding.filter((e) => e.record).map((e) => e.name);
  const webrtc = encoding.filter((e) => e.webrtc).map((e) => e.name);

  return (
    <Section
      icon={BsRecordCircle}
      iconClass="text-orange-500"
      title="Encoding & Capture"
      count={
        record.length + webrtc.length === 0 ? { supported: 0, total: 1 } : undefined
      }
      emptyMessage="This browser reports no encoding capability."
    >
      <Group label="Recording" values={record} />
      <Group label="Realtime" values={webrtc} />
    </Section>
  );
}

/**
 * WebCodecs, decode and encode together.
 *
 * Kept apart from the codec list because it is a separate code path: a browser
 * can play a codec in a <video> element while exposing no WebCodecs decoder
 * for it, and Safari shipped VideoDecoder well before AudioDecoder.
 */
export function WebCodecsSection({ webCodecs }: { webCodecs: WebCodecsSupport }) {
  return (
    <Section
      icon={BsCpu}
      iconClass="text-teal-500"
      title="WebCodecs"
      count={webCodecs.available ? undefined : { supported: 0, total: 1 }}
      emptyMessage="WebCodecs is not available in this browser."
    >
      <Group label="Decode video" values={webCodecs.videoDecode} />
      <Group label="Decode audio" values={webCodecs.audioDecode} />
      <Group label="Encode video" values={webCodecs.videoEncode} />
      <Group label="Encode audio" values={webCodecs.audioEncode} />
    </Section>
  );
}
