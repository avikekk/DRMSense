import { BsDisplay } from 'react-icons/bs';
import type { SystemInfo } from '../types/drm';
import { Card } from './ui/Card';

interface SystemInfoCardProps {
  info: SystemInfo;
}

export function SystemInfoCard({ info }: SystemInfoCardProps) {
  const fields = [
    { label: 'Operating System', value: info.os },
    { label: 'OS Version', value: info.osVersion },
    { label: 'Browser', value: info.browser },
    { label: 'Version', value: info.version },
  ];

  return (
    <Card className="col-span-full mb-6">
      <div className="flex items-center gap-3 mb-4">
        <BsDisplay className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          System Information
        </h2>
        {info.mobile && (
          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            Mobile
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{field.label}</p>
            <p className="font-medium text-gray-900 dark:text-white">{field.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
