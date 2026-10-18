import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  size = 'md',
  className,
}) => {
  let resolvedVariant = variant;

  if (status) {
    const s = status.toUpperCase();
    if (s === 'READY' || s === 'POSTED' || s === 'SUCCESS') resolvedVariant = 'success';
    else if (s === 'PENDING' || s === 'WAITING_FOR_USER' || s === 'WARNING') resolvedVariant = 'warning';
    else if (s === 'IN_PROGRESS' || s === 'INFO') resolvedVariant = 'info';
    else if (s === 'FAILED' || s === 'DANGER' || s === 'ERROR') resolvedVariant = 'danger';
    else if (s === 'SKIPPED' || s === 'DISABLED') resolvedVariant = 'default';
  }

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 font-medium rounded-full border',
          variantStyles[resolvedVariant],
          sizeStyles[size],
          className
        )
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
