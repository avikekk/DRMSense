import { BsShield } from 'react-icons/bs';

export function PageHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <BsShield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          DRMSense
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xl">
        Check your browser's Digital Rights Management (DRM) capabilities and extensive media
        codec support.
      </p>
    </div>
  );
}
