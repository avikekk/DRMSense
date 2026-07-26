import { useEffect, useState } from 'react';
import type { DetailedMediaCapabilities, DRMSystemInfo, SystemInfo } from '../types/drm';
import { detectMediaCapabilities } from '../utils/mediaCapabilities';
import { detectDRMSystems } from '../utils/drmDetector';
import { getSystemInfo } from '../utils/systemInfo';

export interface CapabilityDetection {
  drmSystems: DRMSystemInfo[];
  mediaCapabilities: DetailedMediaCapabilities | null;
  systemInfo: SystemInfo;
  loading: boolean;
}

/**
 * Runs every capability probe once on mount.
 *
 * This is the one place media and DRM detection are composed: media runs
 * first so its HDR results can be handed to the DRM detector.
 */
export function useCapabilityDetection(): CapabilityDetection {
  const [drmSystems, setDrmSystems] = useState<DRMSystemInfo[]>([]);
  const [mediaCapabilities, setMediaCapabilities] =
    useState<DetailedMediaCapabilities | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    os: 'Unknown',
    osVersion: 'Unknown',
    browser: 'Unknown',
    version: 'Unknown',
    mobile: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const media = await detectMediaCapabilities();
        const drm = await detectDRMSystems(media.display.hdr.formats);

        if (cancelled) return;
        setMediaCapabilities(media);
        setDrmSystems(drm);
        setSystemInfo(getSystemInfo());
      } catch (error) {
        console.error('Error detecting DRM support:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, []);

  return { drmSystems, mediaCapabilities, systemInfo, loading };
}
