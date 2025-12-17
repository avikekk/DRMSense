import { Monitor } from 'lucide-react';
import type { SystemInfo } from '../types/drm';

interface SystemInfoCardProps {
  info: SystemInfo;
}

export function SystemInfoCard({ info }: SystemInfoCardProps) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 col-span-full mb-6 border border-gray-100 dark:border-dark-700" role="region" aria-label="System information">
      <div className="flex items-center gap-3 mb-4">
        <Monitor className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Information</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Operating System</p>
          <p className="font-medium text-gray-900 dark:text-white">{info.os}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Browser</p>
          <p className="font-medium text-gray-900 dark:text-white">{info.browser}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Version</p>
          <p className="font-medium text-gray-900 dark:text-white">{info.version}</p>
        </div>
      </div>
    </div>
  );
}
