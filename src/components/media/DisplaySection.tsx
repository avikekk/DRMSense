import { BsDisplay } from 'react-icons/bs';
import type { DisplayCapabilities } from '../../types/drm';
import { Chip, Section } from './Section';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-sm">
      <span className="text-gray-600 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-right text-gray-900 dark:text-white font-medium">{children}</span>
    </div>
  );
}

function Values({ values, empty = 'None' }: { values: string[]; empty?: string }) {
  if (values.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">{empty}</span>;
  }

  return (
    <span className="flex flex-wrap justify-end gap-1">
      {values.map((v) => (
        <Chip key={v}>{v}</Chip>
      ))}
    </span>
  );
}

export function DisplaySection({ display }: { display: DisplayCapabilities }) {
  const gamuts = [
    display.colorGamut.rec2020 && 'Rec. 2020',
    display.colorGamut.p3 && 'Display P3',
    display.colorGamut.sRGB && 'sRGB',
  ].filter((g): g is string => typeof g === 'string');

  const hdrFormats = display.hdr.formats.filter((f) => f.supported).map((f) => f.name);

  return (
    <Section icon={BsDisplay} iconClass="text-blue-500" title="Display & Output">
      <Row label="Resolution">
        {display.screen.width} × {display.screen.height}
      </Row>
      <Row label="Colour Depth">
        {display.screen.bitsPerChannel === null ? (
          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">Unknown</span>
        ) : display.screen.bitsPerChannel === 0 ? (
          'Monochrome'
        ) : (
          <>
            {display.screen.bitsPerChannel}-bit per channel
            <span
              className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1.5"
              title="screen.colorDepth reports bits per pixel, and browsers commonly hard-code 24 regardless of hardware"
            >
              ({display.screen.colorDepth} bpp)
            </span>
          </>
        )}
      </Row>
      {display.screen.refreshRate !== null && (
        <Row label="Refresh Rate">{display.screen.refreshRate} Hz</Row>
      )}
      <Row label="Colour Gamut">
        <Values values={gamuts} />
      </Row>
      <Row label="HDR Display">
        <span
          className={
            display.hdr.supported
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-400 dark:text-gray-500'
          }
        >
          {display.hdr.supported ? 'High dynamic range' : 'Standard dynamic range'}
        </span>
      </Row>
      <Row label="HDR Formats">
        <Values values={hdrFormats} empty="None detected" />
      </Row>
      <Row label="HDR Metadata">
        <Values values={display.hdr.metadataTypes} empty="Not reported" />
      </Row>
      <Row label="Transfer Fn">
        <Values values={display.hdr.transferFunctions} empty="Not reported" />
      </Row>
      {display.maxAudioChannels !== null && (
        <Row label="Audio Output">{display.maxAudioChannels} channels</Row>
      )}
    </Section>
  );
}
