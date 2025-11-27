import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { CompletedTodo, Folder as FolderType, Theme } from '../types';
import { format } from 'date-fns';
import { cn, getPaperColorClass, formatFolderDate } from '../utils';

interface StorageDrawerProps {
  completedTodos: CompletedTodo[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme: Theme;
}

export const StorageDrawer: React.FC<StorageDrawerProps> = ({ completedTodos, isOpen, setIsOpen, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Group items by date
  const folders: FolderType[] = useMemo(() => {
    const groups: Record<string, CompletedTodo[]> = {};
    
    completedTodos.forEach(item => {
      const dateKey = format(item.completedAt, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        items: groups[date].sort((a, b) => b.completedAt - a.completedAt)
      }));
  }, [completedTodos]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    return folders.filter(folder => 
        folder.date.includes(searchQuery) || 
        folder.items.some(i => i.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [folders, searchQuery]);

  const toggleFolder = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  // Theme Config
  const getThemeStyles = () => {
    switch (theme) {
      case 'minimal':
        return {
          container: 'bg-white/80 backdrop-blur-2xl border-l border-white/40',
          handle: 'bg-white/50 border border-white/40 rounded-full',
          headerBg: 'bg-transparent',
          input: 'bg-gray-100 text-gray-800 placeholder-gray-400',
          folderTab: (active: boolean) => active ? 'bg-blue-100 text-blue-900' : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
          folderContent: 'bg-gray-50/50',
          font: 'font-sans'
        };
      case 'cartoon':
        return {
          container: 'bg-orange-400 border-l-4 border-black',
          handle: 'bg-[#FFDE59] border-2 border-black rounded-lg',
          headerBg: 'bg-orange-500 border-2 border-black',
          input: 'bg-white text-black placeholder-gray-500 font-bold',
          folderTab: (active: boolean) => active ? 'bg-[#00FFFF] border-2 border-black' : 'bg-white border-2 border-black hover:bg-gray-100',
          folderContent: 'bg-white border-x-2 border-b-2 border-black',
          font: 'font-patrick'
        };
      case 'retro':
      default:
        return {
          container: 'bg-[#2c241b] border-l-[16px] border-[#1a1614]',
          handle: 'bg-[#5c4e42] border-y border-l border-[#6d5d50] rounded-l-sm',
          headerBg: 'bg-[#1a1614]',
          input: 'bg-[#2a241e] border border-[#3e352f] text-[#d6cfc5] placeholder-[#5c4e42]',
          folderTab: (active: boolean) => active ? "bg-[#ecdca5] border-[#f5ebc4]/50" : "bg-[#d4bc74] border-[#e8d7a4]/40 hover:bg-[#dec67f]",
          folderContent: 'bg-[#26201b]/50 border-x border-b border-[#3e352f]',
          font: 'font-sans'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <>
      {/* Trigger Area */}
      <div 
        className="fixed top-0 right-0 w-4 h-full z-40"
        onMouseEnter={() => setIsOpen(true)}
      />

      {/* The Filing Cabinet Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '92%' }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className={cn(
            "fixed top-0 right-0 w-[400px] h-full shadow-2xl z-50 flex flex-col pointer-events-auto",
            theme === 'retro' ? "" : styles.container
        )}
        onMouseLeave={() => setIsOpen(false)}
        style={theme === 'retro' ? {
            background: '#2c241b',
            borderLeft: '16px solid #1a1614'
        } : {}}
      >
        {/* Handle */}
        <div 
            className={cn(
                "absolute top-1/2 -left-5 w-5 h-24 cursor-pointer flex items-center justify-center shadow-md",
                styles.handle
            )}
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className={cn("w-1 h-12 rounded-full", theme === 'retro' ? "bg-[#3a3029]/50" : "bg-black/10")}></div>
        </div>

        {/* Interior Container */}
        <div className={cn("flex-1 overflow-hidden flex flex-col relative p-4", styles.headerBg)}>
            
            {/* Header / Search */}
            <div className="mb-6 z-10">
                <div className={cn("p-3 rounded flex gap-2", styles.input)}>
                    <Search className={cn("w-5 h-5", theme === 'retro' ? "text-[#8b7d70]" : "text-gray-400")} />
                    <input 
                        type="text" 
                        placeholder="Search Archive..." 
                        className={cn("bg-transparent w-full outline-none text-sm", styles.font)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar pr-2">
                <div className="space-y-4 pb-10">
                    {filteredFolders.length === 0 && (
                        <div className={cn("text-center mt-10 uppercase tracking-widest text-sm", theme === 'retro' ? "text-[#5c4e42]" : "text-black/30")}>
                            Empty Cabinet
                        </div>
                    )}

                    {filteredFolders.map((folder) => {
                        const isExpanded = expandedDate === folder.date;
                        return (
                            <div key={folder.date} className="relative group">
                                {/* Folder Header */}
                                <div 
                                    onClick={() => toggleFolder(folder.date)}
                                    className="relative cursor-pointer z-10"
                                >
                                    {/* Retro has specific styling logic for tabs that is hard to generalize, preserving it conditionally */}
                                    {theme === 'retro' ? (
                                        <>
                                            <div className={cn(
                                                "absolute -top-1 left-0 w-24 h-6 rounded-t-sm border-t border-l border-r transition-colors",
                                                isExpanded ? "bg-[#e3cd8b] border-[#f0e0b0]/50" : "bg-[#cbb577] border-[#e8d7a4]/30"
                                            )}></div>
                                            <div className={cn(
                                                "relative h-12 rounded-t-sm shadow-sm flex items-center px-4 justify-between border-t transition-colors mt-4",
                                                styles.folderTab(isExpanded)
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronDown size={14} className="text-[#8c7a4b]" /> : <ChevronRight size={14} className="text-[#8c7a4b]" />}
                                                    <FolderOpen size={16} className="text-[#8c7a4b]" />
                                                    <span className="text-[#4a3f28] text-sm font-sans font-bold tracking-wide">
                                                        {formatFolderDate(folder.date)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] bg-[#4a3f28]/10 px-1.5 py-0.5 rounded text-[#4a3f28] font-bold">
                                                    {folder.items.length}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        // Modern / Cartoon Tabs
                                        <div className={cn(
                                            "relative h-12 flex items-center px-4 justify-between transition-colors mt-2 rounded-lg shadow-sm",
                                            styles.folderTab(isExpanded),
                                            styles.font
                                        )}>
                                             <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                <FolderOpen size={18} />
                                                <span className="text-sm font-bold tracking-wide">
                                                    {formatFolderDate(folder.date)}
                                                </span>
                                            </div>
                                            <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-bold">
                                                {folder.items.length}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Folder Contents (Accordion) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className={cn("overflow-hidden rounded-b-sm mb-2", styles.folderContent)}
                                        >
                                            <div className="p-3 space-y-3 pt-4">
                                                {folder.items.map((item) => (
                                                    <div 
                                                        key={item.id}
                                                        className={cn(
                                                            "p-3 flex flex-col gap-1 relative",
                                                            theme === 'retro' ? "shadow-sm font-typewriter text-sm rounded-[1px]" : "",
                                                            theme === 'minimal' ? "shadow-sm rounded-lg border border-gray-100 font-sans text-sm" : "",
                                                            theme === 'cartoon' ? "shadow-[2px_2px_0px_black] border border-black rounded font-patrick text-sm font-bold" : "",
                                                            getPaperColorClass(item.color, theme)
                                                        )}
                                                    >
                                                        <div className="text-xs opacity-50 font-mono mb-1 border-b border-black/10 pb-1">
                                                            {format(item.completedAt, 'HH:mm:ss')}
                                                        </div>
                                                        <div className="line-through decoration-black/30 opacity-70 leading-tight">
                                                            {item.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2); 
        }
      `}</style>
    </>
  );
};