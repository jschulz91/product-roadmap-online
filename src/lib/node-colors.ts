import type { CSSProperties } from 'react';

export type NodeColorStyles = CSSProperties;

export const DEFAULT_HEX = '#3B82F6';

export const COLOR_PRESETS: Array<{ label: string; hex: string }> = [
  { label: 'Blau',    hex: '#3B82F6' },
  { label: 'Lila',    hex: '#A855F7' },
  { label: 'Tuerkis', hex: '#14B8A6' },
  { label: 'Orange',  hex: '#F97316' },
  { label: 'Rosa',    hex: '#F43F5E' },
  { label: 'Gruen',   hex: '#10B981' },
  { label: 'Gelb',    hex: '#F59E0B' },
  { label: 'Indigo',  hex: '#6366F1' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

const CONFIG = {
  goal:    { bgAlpha: 0.10, borderAlpha: 0.55, darkBgAlpha: 0.18, darkBorderAlpha: 0.6 },
  feature: { bgAlpha: 0.06, borderAlpha: 0.35, darkBgAlpha: 0.12, darkBorderAlpha: 0.4 },
  task:    { bgAlpha: 0.04, borderAlpha: 0.22, darkBgAlpha: 0.08, darkBorderAlpha: 0.3 },
};

export function getNodeColorStyles(
  hex: string | null,
  level: 'goal' | 'feature' | 'task',
  isDark: boolean
): CSSProperties {
  const color = hex || DEFAULT_HEX;
  const c = CONFIG[level];
  return {
    background: rgba(color, isDark ? c.darkBgAlpha : c.bgAlpha),
    borderColor: rgba(color, isDark ? c.darkBorderAlpha : c.borderAlpha),
  };
}

export function getAccentColor(hex: string | null): string {
  return hex || DEFAULT_HEX;
}

export function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}
