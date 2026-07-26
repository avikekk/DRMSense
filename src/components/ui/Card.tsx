import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Shared panel shell used by every card on the page. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-dark-700 ${className}`}
    >
      {children}
    </div>
  );
}
