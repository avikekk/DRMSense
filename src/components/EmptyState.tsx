import { BsShield } from 'react-icons/bs';

export function EmptyState() {
  return (
    <div className="col-span-full text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
      <BsShield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No active DRM systems detected
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Your browser doesn't appear to support any of the key systems checked by this tool
        (Widevine, PlayReady, FairPlay, WisePlay, ClearKey). Encrypted Media Extensions may be
        disabled in your browser settings.
      </p>
    </div>
  );
}
