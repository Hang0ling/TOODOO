import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Todo, Theme } from '../types';
import { cn, getPaperColorClass, formatPaperTimestamp } from '../utils';

interface PaperStripProps {
  todo: Todo;
  theme: Theme;
  onComplete: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number, pointer: { x: number, y: number }) => void;
  onBringToFront: (id: string) => void;
}

export const PaperStrip: React.FC<PaperStripProps> = ({ 
  todo, 
  theme,
  onComplete, 
  onUpdatePosition,
  onBringToFront
}) => {
  
  // Dimensions based on isLarge flag
  const widthClass = todo.isLarge ? 'w-80' : 'w-64';
  const heightStyle = todo.isLarge ? { height: '240px' } : { height: 'auto', minHeight: '120px' };

  // Theme-specific variants
  const getThemeStyles = () => {
    switch(theme) {
      case 'minimal':
        return {
          font: 'font-sans',
          shadow: 'shadow-lg backdrop-blur-md',
          borderRadius: 'rounded-xl',
          opacity: 'opacity-95',
          tape: false,
          checkBtn: 'bg-black/5 hover:bg-green-500 hover:text-white rounded-full p-1',
          dateStyle: 'text-xs text-gray-400 font-sans'
        };
      case 'cartoon':
        return {
          font: 'font-patrick', // Patrick Hand
          shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          borderRadius: 'rounded-lg',
          opacity: 'opacity-100',
          tape: false,
          checkBtn: 'bg-white border-2 border-black hover:bg-green-400 text-black rounded-md p-1',
          dateStyle: 'text-xs font-bold text-black/70'
        };
      case 'retro':
      default:
        return {
          font: 'font-typewriter',
          shadow: 'shadow-[1px_2px_8px_rgba(0,0,0,0.15)]',
          borderRadius: 'rounded-[1px]',
          opacity: 'opacity-100',
          tape: true,
          checkBtn: 'text-black/20 hover:text-green-700',
          dateStyle: 'text-[10px] opacity-50 font-mono tracking-tight'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ 
          x: window.innerWidth / 2 - 128, 
          y: window.innerHeight - 340, 
          scale: 0.95, 
          opacity: 0 
        }}
        animate={{ 
          x: todo.x, 
          y: todo.y, 
          rotate: todo.rotation, 
          scale: 1, 
          opacity: 1,
          zIndex: todo.zIndex
        }}
        onDragEnd={(event, info) => {
          onUpdatePosition(
              todo.id, 
              todo.x + info.offset.x, 
              todo.y + info.offset.y,
              info.point
          );
        }}
        onPointerDown={() => onBringToFront(todo.id)}
        whileHover={{ scale: 1.02, cursor: 'grab' }}
        whileDrag={{ scale: 1.05, cursor: 'grabbing', rotate: 0, zIndex: 9999 }}
        className={cn(
          "absolute flex flex-col justify-between select-none p-4 pt-5",
          getPaperColorClass(todo.color, theme),
          styles.font,
          styles.shadow,
          styles.borderRadius,
          widthClass
        )}
        style={{
          ...heightStyle,
        }}
      >
        {/* Tape Visual (Retro Only) */}
        {styles.tape && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white/40 backdrop-blur-[1px] rotate-1 shadow-sm border-l border-r border-white/20" 
              style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0% 100%)' }}>
          </div>
        )}

        {/* Complete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(todo.id);
          }}
          className={cn(
            "absolute top-2 right-2 transition-all z-10",
            styles.checkBtn
          )}
          title="Mark as Done"
        >
          <Check size={18} strokeWidth={3} />
        </button>

        {/* Text Content */}
        <div className="flex-1 mb-2 mt-1 overflow-y-auto custom-scrollbar pr-1 relative">
          <p className={cn(
              "leading-snug break-words whitespace-pre-wrap",
              todo.isLarge ? "text-lg" : "text-xl",
              theme === 'retro' ? "font-medium opacity-90 text-[#2a2a2a]" : "",
              theme === 'minimal' ? "font-normal text-gray-700" : "",
              theme === 'cartoon' ? "font-bold text-black" : ""
          )}>
            {todo.text}
          </p>
        </div>

        {/* Footer Date */}
        <div className={cn(
            "pt-1 mt-auto text-center w-full shrink-0",
            theme === 'retro' && "border-t border-black/10",
            theme === 'minimal' && "border-t border-gray-200/50",
            theme === 'cartoon' && "border-t-2 border-black/10"
        )}>
          <p className={styles.dateStyle}>
              {formatPaperTimestamp(todo.createdAt)}
          </p>
        </div>
      </motion.div>
      
      {/* Scoped Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2); 
        }
      `}</style>
    </>
  );
};