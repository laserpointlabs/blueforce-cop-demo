import React from 'react';

type IconSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeToPx: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
};

export function Icon({ name, size = 'md', className }: { name: string; size?: IconSize; className?: string }) {
  const fontSize = sizeToPx[size];
  return <i className={`codicon codicon-${name} ${className ?? ''}`} style={{ fontSize }} aria-hidden />;
}



