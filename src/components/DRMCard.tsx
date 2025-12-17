import * as Icons from 'lucide-react';
import { DRMSystemInfo } from '../types/drm';

interface DRMCardProps {
  system: DRMSystemInfo;
}

export function DRMCard({ system }: DRMCardProps) {
  // Type-safe icon lookup with fallback
  const IconComponent = (Icons[system.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) || Icons.Shield;

  return (
    <div
      className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 transition-all hover:shadow-lg border border-gray-100 dark:border-dark-700"
      role="article"
      aria-label={`${system.name} DRM information`}
    >
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className={`w-8 h-8 ${system.supported ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{system.name}</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            Status: <span className={`font-medium ${system.supported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {system.supported ? 'Supported' : 'Not Supported'}
            </span>
          </p>
          {system.supported && (
            <p className="text-gray-600 dark:text-gray-300">
              Security Level: <span className="font-medium dark:text-white">{system.securityLevel}</span>
            </p>
          )}
        </div>

        {system.supported && (
          <>
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">Supported Resolutions:</p>
              <div className="flex flex-wrap gap-2">
                {system.supportedResolutions.map((resolution) => (
                  <span
                    key={resolution.name}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {resolution.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">Video Codec Support:</p>
              <div className="flex flex-wrap gap-2">
                {system.supportedCodecs.map((codec) => (
                  <span
                    key={codec.name}
                    className={`px-3 py-1 rounded-full text-sm ${codec.supported
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {codec.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">Audio Codec Support:</p>
              <div className="flex flex-wrap gap-2">
                {system.supportedAudioCodecs.map((codec) => (
                  <span
                    key={codec.name}
                    className={`px-3 py-1 rounded-full text-sm ${codec.supported
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {codec.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">HDR Capabilities:</p>
              <div className="flex flex-wrap gap-2">
                {system.hdrCapabilities.map((hdr) => (
                  <span
                    key={hdr.name}
                    className={`px-3 py-1 rounded-full text-sm ${hdr.supported
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                    title={hdr.description}
                  >
                    {hdr.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Persistent License: <span className={`font-medium ${system.persistentLicenseSupport ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {system.persistentLicenseSupport ? 'Supported' : 'Not Supported'}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
