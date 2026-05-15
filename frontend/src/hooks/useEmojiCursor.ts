import { useEffect } from 'react';

function emojiToDataUrl(emoji: string, size = 32): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.font = `${Math.round(size * 0.85)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 1);
  return canvas.toDataURL();
}

export function useEmojiCursor(): void {
  useEffect(() => {
    const url = emojiToDataUrl('🐾', 32);
    if (!url) return;
    const root = document.documentElement;
    root.style.setProperty('--cursor-grab',     `url("${url}") 16 16, grab`);
    root.style.setProperty('--cursor-grabbing', `url("${url}") 16 16, grabbing`);
    root.style.setProperty('--cursor-click',    `url("${url}") 16 16, pointer`);
  }, []);
}
