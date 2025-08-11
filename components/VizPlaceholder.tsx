"use client";
import React from 'react';

export function VizPlaceholder({ layer }: { layer: string }) {
  const label = (layer || 'none').toLowerCase();
  return (
    <div
      className="rounded border p-4 min-h-[160px] flex items-center justify-center"
      style={{ backgroundColor: 'var(--theme-bg-primary)', borderColor: 'var(--theme-border)' }}
    >
      <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
        Rendering placeholder layer: <span className="font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--theme-border)' }}>{label}</span>
      </div>
    </div>
  );
}


