import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl overflow-hidden shadow-card transition-all',
          className
        )
      )}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div className="p-6">{children}</div>

      {footer && <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/80">{footer}</div>}
    </div>
  );
};
