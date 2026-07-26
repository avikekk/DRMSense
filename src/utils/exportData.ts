import type { DetailedMediaCapabilities, DRMSystemInfo, SystemInfo } from '../types/drm';

export interface ExportPayload {
  systemInfo: SystemInfo;
  drmSystems: DRMSystemInfo[];
  mediaCapabilities: DetailedMediaCapabilities | null;
  exportedAt: string;
}

/**
 * The exported JSON is this app's one stable output contract — people paste it
 * into bug reports. Keep the shape stable.
 */
export function buildExportPayload(
  systemInfo: SystemInfo,
  drmSystems: DRMSystemInfo[],
  mediaCapabilities: DetailedMediaCapabilities | null,
): ExportPayload {
  return {
    systemInfo,
    drmSystems,
    mediaCapabilities,
    exportedAt: new Date().toISOString(),
  };
}

export function exportFilename(exportedAt: string): string {
  return `drm-sense-data-${exportedAt.split('T')[0]}.json`;
}

export function downloadJson(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
