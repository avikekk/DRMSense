import {
  BsBattery,
  BsFilm,
  BsLayers,
  BsMusicNoteBeamed,
  BsSpeedometer2,
} from 'react-icons/bs';
import type {
  DetailedAudioCodecInfo,
  DetailedCodecInfo,
  PlaybackModeSupport,
} from '../../types/drm';
import { Chip, Section } from './Section';

interface FamilyGroup<T> {
  family: string;
  supported: T[];
  total: number;
  /** The variant carrying the family's detail probes. */
  lead: T | undefined;
}

/**
 * Group variants under their family, keeping input order.
 *
 * With ~50 video and ~40 audio codec strings, a flat list is unreadable — and
 * misleading, since eight H.264 levels are one capability, not eight.
 */
function groupByFamily<T extends { family: string; supported: boolean }>(
  codecs: T[],
): FamilyGroup<T>[] {
  const groups = new Map<string, FamilyGroup<T>>();

  for (const codec of codecs) {
    let group = groups.get(codec.family);
    if (!group) {
      group = { family: codec.family, supported: [], total: 0, lead: undefined };
      groups.set(codec.family, group);
    }
    group.total += 1;
    if (codec.supported) {
      group.supported.push(codec);
      group.lead ??= codec;
    }
  }

  return [...groups.values()].filter((g) => g.supported.length > 0);
}

function ModeChips({ modes }: { modes?: PlaybackModeSupport }) {
  if (!modes) return null;

  const labels = [
    modes.file && 'File',
    modes.mediaSource && 'MSE',
    modes.webrtc && 'WebRTC',
  ].filter((l): l is string => typeof l === 'string');

  if (labels.length === 0) return null;

  return <Chip title="Playback modes reported by decodingInfo">{labels.join(' · ')}</Chip>;
}

function FamilyBlock({
  family,
  count,
  chips,
  variants,
}: {
  family: string;
  count: string;
  chips: React.ReactNode;
  variants: string[];
}) {
  return (
    <div className="animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{family}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
          {count}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
        {chips}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
        {variants.join(' · ')}
      </p>
    </div>
  );
}

export function VideoCodecSection({ codecs }: { codecs: DetailedCodecInfo[] }) {
  const groups = groupByFamily(codecs);
  const supportedCount = codecs.filter((c) => c.supported).length;

  return (
    <Section
      icon={BsFilm}
      iconClass="text-cyan-500"
      title="Video Codecs"
      count={{ supported: supportedCount, total: codecs.length }}
      emptyMessage="No video codecs supported by this browser."
      className="space-y-3"
    >
      {groups.map((group) => (
        <FamilyBlock
          key={group.family}
          family={group.family}
          count={`${group.supported.length}/${group.total}`}
          variants={group.supported.map((c) => c.name)}
          chips={
            <>
              <ModeChips modes={group.lead?.modes} />
              {group.lead?.smooth && (
                <span className="flex items-center" title="Smooth playback likely">
                  <BsSpeedometer2 className="w-3 h-3 mr-1" /> Smooth
                </span>
              )}
              {group.lead?.powerEfficient && (
                <span className="flex items-center" title="Power efficient (hardware decoding)">
                  <BsBattery className="w-3 h-3 mr-1" /> Efficient
                </span>
              )}
              {group.lead?.hasAlphaChannel && (
                <span className="flex items-center" title="Supports an alpha (transparency) channel">
                  <BsLayers className="w-3 h-3 mr-1" /> Alpha
                </span>
              )}
              {group.lead?.maxSmoothResolution && (
                <Chip title="Highest resolution that decodes without dropping frames">
                  up to {group.lead.maxSmoothResolution}
                </Chip>
              )}
              {group.lead?.maxResolution &&
                group.lead.maxResolution !== group.lead.maxSmoothResolution && (
                  <Chip title="Decodes, but not smoothly at this resolution">
                    {group.lead.maxResolution} (not smooth)
                  </Chip>
                )}
              {group.lead?.hdrMetadataTypes?.map((type) => (
                <Chip key={type} title="HDR metadata format accepted with this codec">
                  {type}
                </Chip>
              ))}
            </>
          }
        />
      ))}
    </Section>
  );
}

export function AudioCodecSection({ codecs }: { codecs: DetailedAudioCodecInfo[] }) {
  const groups = groupByFamily(codecs);
  const supportedCount = codecs.filter((c) => c.supported).length;

  return (
    <Section
      icon={BsMusicNoteBeamed}
      iconClass="text-pink-500"
      title="Audio Codecs"
      count={{ supported: supportedCount, total: codecs.length }}
      emptyMessage="No audio codecs supported by this browser."
      className="space-y-3"
    >
      {groups.map((group) => {
        // Stereo is the assumed baseline; only surround layouts are notable.
        const surround = group.lead?.channelLayouts?.filter((l) => l !== 'Stereo') ?? [];

        return (
          <FamilyBlock
            key={group.family}
            family={group.family}
            count={`${group.supported.length}/${group.total}`}
            variants={group.supported.map((c) => c.name)}
            chips={
              <>
                <ModeChips modes={group.lead?.modes} />
                {surround.map((layout) => (
                  <Chip key={layout}>{layout}</Chip>
                ))}
                {group.lead?.spatialRendering && (
                  <Chip title="Object-based / spatial audio (Dolby Atmos)">Spatial</Chip>
                )}
              </>
            }
          />
        );
      })}
    </Section>
  );
}
