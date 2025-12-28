import React from 'react';
import * as Icons from 'lucide-react';
import { DRMSystemInfo } from '../types/drm';

interface DRMCardProps {
  system: DRMSystemInfo;
}

export function DRMCard({ system }: DRMCardProps) {
  const Icon = Icons[system.icon as keyof typeof Icons];

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 transition-all hover:shadow-lg border border-gray-100 dark:border-dark-700">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${system.supported ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`} />
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
          <div className="pt-2 border-t border-gray-100 dark:border-dark-700 mt-2">
            <p className="text-gray-600 dark:text-gray-300">
              Persistent License: <span className={`font-medium ${system.persistentLicenseSupport ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {system.persistentLicenseSupport ? 'Supported' : 'Not Supported'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
