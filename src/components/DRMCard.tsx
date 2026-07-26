import { BsShield, BsShieldCheck, BsShieldExclamation, BsShieldLock, BsKey } from 'react-icons/bs';
import type { IconType } from 'react-icons';
import type { DRMSystemInfo } from '../types/drm';
import { Card } from './ui/Card';

const ICONS: Record<string, IconType> = {
  Shield: BsShield,
  ShieldCheck: BsShieldCheck,
  ShieldAlert: BsShieldExclamation,
  ShieldLock: BsShieldLock,
  Key: BsKey,
};

/** Hardware-backed levels deserve visual emphasis — they gate 4K/HDR content. */
function isHardwareLevel(level: string): boolean {
  return /L1|SL3000|Hardware/i.test(level);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-sm">
      <span className="text-gray-600 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-right font-medium text-gray-900 dark:text-white">{children}</span>
    </div>
  );
}

function Pills({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 font-normal">{empty}</span>;
  }

  return (
    <span className="flex flex-wrap justify-end gap-1">
      {values.map((value) => (
        <span
          key={value}
          className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono"
        >
          {value}
        </span>
      ))}
    </span>
  );
}

interface DRMCardProps {
  system: DRMSystemInfo;
}

export function DRMCard({ system }: DRMCardProps) {
  const Icon = ICONS[system.icon] ?? BsShield;
  const hardware = isHardwareLevel(system.securityLevel);
  const supportedCodecs = system.supportedCodecs.filter((c) => c.supported);

  return (
    <Card className="transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-8 h-8 text-green-500 dark:text-green-400" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{system.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
            {system.keySystem}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <Row label="Security Level">
          <span
            className={
              hardware
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            }
          >
            {system.securityLevel}
          </span>
        </Row>

        {system.videoRobustness.length > 0 && (
          <Row label="Video Robustness">
            <Pills values={system.videoRobustness} empty="—" />
          </Row>
        )}

        <Row label="Encryption">
          <Pills values={system.encryptionSchemes} empty="Not reported" />
        </Row>

        {system.hdcpVersions.length > 0 && (
          <Row label="Max HDCP">
            <span className="font-mono text-xs">
              {system.hdcpVersions[system.hdcpVersions.length - 1]}
            </span>
          </Row>
        )}

        {supportedCodecs.length > 0 && (
          <Row label="Encrypted Playback">
            <span className="flex flex-wrap justify-end gap-1">
              {supportedCodecs.map((codec) => (
                <span
                  key={codec.name}
                  title={
                    codec.powerEfficient
                      ? 'Hardware-accelerated under this key system'
                      : 'Software decode under this key system'
                  }
                  className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono"
                >
                  {codec.name}
                  {codec.maxResolution ? ` \u2264${codec.maxResolution}` : ''}
                  {codec.powerEfficient ? ' \u26a1' : ''}
                </span>
              ))}
            </span>
          </Row>
        )}

        <div className="pt-2.5 border-t border-gray-100 dark:border-dark-700 space-y-2.5">
          <Row label="Persistent License">
            <span
              className={
                system.persistentLicenseSupport
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }
            >
              {system.persistentLicenseSupport ? 'Supported' : 'Not Supported'}
            </span>
          </Row>
          <Row label="Distinctive ID">
            <span
              className={
                system.distinctiveIdentifier
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }
            >
              {system.distinctiveIdentifier ? 'Available' : 'Not Available'}
            </span>
          </Row>
        </div>

        {system.keySystems.length > 1 && (
          <div className="pt-2.5 border-t border-gray-100 dark:border-dark-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1.5">Key Systems</p>
            <div className="space-y-1">
              {system.keySystems.map((ks) => (
                <div key={ks.keySystem} className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      ks.supported
                        ? 'text-green-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }
                  >
                    {ks.supported ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{ks.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
