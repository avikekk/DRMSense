import type { DetailedMediaCapabilities } from '../types/drm';
import { Card } from './ui/Card';
import { ContainersSection } from './media/ContainersSection';
import { AudioCodecSection, VideoCodecSection } from './media/CodecSections';
import { DisplaySection } from './media/DisplaySection';
import { EncodingSection, WebCodecsSection } from './media/EncodingSection';

interface MediaCapabilitiesCardProps {
  capabilities: DetailedMediaCapabilities;
}

/**
 * The Media Info tab. Every section lists only what the browser actually
 * supports; the full probe results, including negatives, go to the JSON
 * export for anyone diffing environments.
 */
export function MediaCapabilitiesCard({ capabilities }: MediaCapabilitiesCardProps) {
  return (
    <div className="space-y-6">
      <Card className="col-span-full">
        <ContainersSection containers={capabilities.containers} />
      </Card>

      <Card className="col-span-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VideoCodecSection codecs={capabilities.videoCodecs} />
          <AudioCodecSection codecs={capabilities.audioCodecs} />
        </div>
      </Card>

      <Card className="col-span-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DisplaySection display={capabilities.display} />
          <div className="space-y-8">
            <EncodingSection encoding={capabilities.encoding} />
            <WebCodecsSection webCodecs={capabilities.webCodecs} />
          </div>
        </div>
      </Card>
    </div>
  );
}
