import type { IconType } from 'react-icons';

interface SectionProps {
  icon: IconType;
  iconClass: string;
  title: string;
  /** Optional "n of m supported" counter. */
  count?: { supported: number; total: number };
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  icon: Icon,
  iconClass,
  title,
  count,
  emptyMessage,
  children,
  className = 'space-y-2',
}: SectionProps) {
  const empty = count?.supported === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-dark-700">
        <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {count && (
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
            {count.supported} of {count.total} supported
          </span>
        )}
      </div>
      {empty && emptyMessage ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 p-2">{emptyMessage}</p>
      ) : (
        <div className={className}>{children}</div>
      )}
    </div>
  );
}

export function Chip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded"
    >
      {children}
    </span>
  );
}
