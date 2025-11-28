import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { PaperColor, Theme } from '../types';
import { cn } from '../utils';

interface PrinterProps {
  onPrint: (text: string, color: PaperColor) => void;
  theme: Theme;
}

const colors: PaperColor[] = ['white', 'yellow', 'blue', 'pink'];

export const Printer: React.FC<PrinterProps> = ({ onPrint, theme }) => {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState<PaperColor>('white');
  const [isPrinting, setIsPrinting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isPrinting) return;

    setIsPrinting(true);
    
    // Animation timing:
    // Slide up gently (0.6s)
    setTimeout(() => {
        onPrint(text, selectedColor);
        setText('');
        setIsPrinting(false);
    }, 600);
  };

  // --- THEME VARIATIONS ---

  if (theme === 'minimal') {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50">
             {/* Simple Glass Bar */}
             <form onSubmit={handleSubmit} className="relative">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-2 flex items-center gap-2 border border-white/40">
                    <div className="flex gap-1.5 px-2">
                        {colors.map((c) => (
                             <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedColor(c)}
                                className={cn(
                                    "w-4 h-4 rounded-full transition-all",
                                    c === 'yellow' ? "bg-yellow-300" : 
                                    c === 'blue' ? "bg-cyan-300" : 
                                    c === 'pink' ? "bg-rose-300" : "bg-gray-200",
                                    selectedColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "opacity-50 hover:opacity-100"
                                )}
                            />
                        ))}
                    </div>
                    <div className="h-6 w-px bg-gray-300/50 mx-1"></div>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="New task..."
                        className="flex-1 bg-transparent text-gray-700 font-sans text-lg outline-none placeholder-gray-400 px-2"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || isPrinting}
                        className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
             </form>
        </div>
    );
  }

  if (theme === 'cartoon') {
      return (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-xl z-50 flex flex-col items-center">
             {/* Pop Art Printer */}
             <div className="relative w-full">
                <div className="bg-[#A855F7] rounded-t-3xl border-x-4 border-t-4 border-black p-6 relative z-20 shadow-[8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-72 h-6 bg-black rounded-full border-4 border-white"></div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-2">
                        <div className="bg-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                             <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full bg-transparent text-black font-patrick text-2xl outline-none placeholder-gray-300 font-bold"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="flex gap-2 bg-white border-2 border-black p-2 rounded-lg">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSelectedColor(c)}
                                        className={cn(
                                            "w-8 h-8 rounded border-2 border-black transition-transform active:translate-y-1",
                                            c === 'yellow' ? "bg-[#FFFF00]" : 
                                            c === 'blue' ? "bg-[#00FFFF]" : 
                                            c === 'pink' ? "bg-[#FF69B4]" : "bg-white",
                                            selectedColor === c ? "shadow-[2px_2px_0px_black] -translate-y-1" : ""
                                        )}
                                    />
                                ))}
                             </div>
                             <button
                                type="submit"
                                disabled={!text.trim() || isPrinting}
                                className="bg-[#FFDE59] hover:bg-[#ffe580] text-black border-2 border-black px-6 py-2 rounded-lg font-bold font-patrick text-xl shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center gap-2"
                            >
                                PRINT <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        </div>
      );
  }

  // Retro (Default)
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-xl flex flex-col items-center z-50">
      
      {/* Paper Output Animation (Only meaningful for Retro usually, but kept simple) */}
      <div className="absolute bottom-[100px] w-64 z-10 pointer-events-none">
        <AnimatePresence>
            {isPrinting && (
                <motion.div
                    initial={{ y: 80, opacity: 1 }}
                    animate={{ y: -20 }} // Slight slide up
                    exit={{ opacity: 0, transition: { duration: 0.01 } }} // Instant disappear when real note replaces it
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn(
                        "w-64 h-40 shadow-sm rounded-sm border relative overflow-hidden flex flex-col p-4 pt-6",
                        selectedColor === 'yellow' && "bg-[#fff475]",
                        selectedColor === 'blue' && "bg-[#a6e4f0]",
                        selectedColor === 'pink' && "bg-[#ffb7b2]",
                        selectedColor === 'white' && "bg-[#f4f4f4]",
                    )}
                >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white/40 rotate-1"></div>
                    <div className="font-typewriter text-xl opacity-90 text-[#2a2a2a] mt-1 leading-snug">
                        {text}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Retro Printer Body */}
      <div className="relative w-full">
        {/* Main Case */}
        <div className="bg-[#e3ded1] rounded-t-lg shadow-2xl p-6 relative border-t-8 border-[#dcd6c6] z-20">
            
            {/* Output Slot */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-72 h-4 bg-[#1a1a1a] rounded-lg shadow-inner border-b border-white/10"></div>

            <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 max-w-md mx-auto mt-2">
                
                {/* LCD Display / Input */}
                <div className="bg-[#9ea792] p-3 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b-2 border-white/20">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder=""
                        className="w-full bg-transparent text-[#2a2f26] font-mono text-xl outline-none placeholder-[#2a2f26]/40 uppercase tracking-widest"
                        autoFocus
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Color Toggle Buttons (Mechanical style) */}
                    <div className="flex gap-2 bg-[#d1cbc1] p-1.5 rounded-md shadow-inner border border-white/50">
                        {colors.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedColor(c)}
                                className={cn(
                                    "w-8 h-8 rounded-sm border-b-4 transition-all active:border-b-0 active:translate-y-[4px]",
                                    c === 'yellow' ? "bg-[#fff475] border-[#d4c965]" : 
                                    c === 'blue' ? "bg-[#a6e4f0] border-[#8bc3ce]" : 
                                    c === 'pink' ? "bg-[#ffb7b2] border-[#dca19d]" : "bg-[#f4f4f4] border-[#d1d1d1]",
                                    selectedColor === c ? "brightness-110 translate-y-[2px] border-b-2 shadow-inner" : "opacity-80"
                                )}
                            />
                        ))}
                    </div>

                    {/* Big Print Button */}
                    <button
                        type="submit"
                        disabled={!text.trim() || isPrinting}
                        className="
                            relative overflow-hidden group
                            bg-[#b8afa1] hover:bg-[#c2b9ab] active:bg-[#a69d8f]
                            text-[#5a5245] px-6 py-2 rounded shadow-[0_4px_0_#8b8376] active:shadow-[0_0_0_#8b8376] active:translate-y-[4px]
                            transition-all duration-100 border border-[#d6cfc5]
                        "
                    >
                        <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                            Print <Send size={14} />
                        </span>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};