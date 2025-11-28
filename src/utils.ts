import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PaperColor, Theme } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const getRandomRotation = () => Math.random() * 6 - 3; // Reduced rotation for neater look

// biasX: 'left' | 'right' | 'any'
export const getRandomPosition = (maxWidth: number, maxHeight: number, biasX: 'left' | 'right' | 'any' = 'any') => {
  const padding = 50;
  const bottomReserved = 250; // Space for printer
  
  let minX = padding;
  let maxX = maxWidth - 350; // width of paper

  if (biasX === 'left') {
    maxX = (maxWidth / 2) - 100;
  } else if (biasX === 'right') {
    minX = (maxWidth / 2) + 50;
  }

  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxHeight - bottomReserved - padding) + padding,
  };
};

export const formatDateFull = (date: Date | number) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getHeaderDateParts = (date: Date) => {
  return {
    dateLine: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    weekdayLine: date.toLocaleDateString('en-US', {
      weekday: 'long',
    })
  };
};

// Format: yyyy年mm月dd日
export const formatFolderDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
};

// Format: YYYY-MM-DD HH:MM:SS
export const formatPaperTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, 
  });
};

export const getPaperColorClass = (color: PaperColor, theme: Theme) => {
  if (theme === 'cartoon') {
    switch (color) {
      case 'pink': return 'bg-[#FF69B4] text-black border-2 border-black';
      case 'blue': return 'bg-[#00FFFF] text-black border-2 border-black';
      case 'white': return 'bg-white text-black border-2 border-black';
      case 'yellow':
      default: return 'bg-[#FFFF00] text-black border-2 border-black';
    }
  }

  if (theme === 'minimal') {
    // Glassmorphism subtle tints
    switch (color) {
      case 'pink': return 'bg-red-50/80 text-slate-800 border border-white/50';
      case 'blue': return 'bg-blue-50/80 text-slate-800 border border-white/50';
      case 'white': return 'bg-white/80 text-slate-800 border border-white/50';
      case 'yellow':
      default: return 'bg-yellow-50/80 text-slate-800 border border-white/50';
    }
  }

  // Retro (Default)
  switch (color) {
    case 'pink': return 'bg-[#ffb7b2] text-slate-900';
    case 'blue': return 'bg-[#a6e4f0] text-slate-900';
    case 'white': return 'bg-[#f4f4f4] text-slate-900';
    case 'yellow':
    default: return 'bg-[#fff475] text-slate-900';
  }
};

export const checkIntersection = (
  box: { x: number; y: number; w: number; h: number },
  item: { x: number; y: number; w: number; h: number }
) => {
  return (
    box.x < item.x + item.w &&
    box.x + box.w > item.x &&
    box.y < item.y + item.h &&
    box.y + box.h > item.y
  );
};
