import { BsDownload } from 'react-icons/bs';

interface ExportButtonProps {
  onExport: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      className="fixed top-4 right-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-50 text-gray-700 dark:text-gray-300"
      aria-label="Export Data"
      title="Export Data"
    >
      <BsDownload className="w-5 h-5" />
    </button>
  );
}
