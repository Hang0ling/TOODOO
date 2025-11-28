import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Trash2, Palette, Monitor, Sun } from 'lucide-react';
import { Todo, CompletedTodo, PaperColor, Theme } from './types';
import { generateId, getRandomRotation, formatTime, getHeaderDateParts, cn } from './utils';
import { PaperStrip } from './components/PaperStrip';
import { Printer } from './components/Printer';
import { StorageDrawer } from './components/StorageDrawer';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<CompletedTodo[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  const [theme, setTheme] = useState<Theme>('retro');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrint = (text: string, color: PaperColor) => {
    const containerW = containerRef.current?.offsetWidth || window.innerWidth;
    const containerH = containerRef.current?.offsetHeight || window.innerHeight;
    
    // Size logic: > 50 chars is Large
    const isLarge = text.length > 50;

    const targetX = containerW / 2 - (isLarge ? 160 : 128); // Center based on width
    const targetY = containerH - 340; 

    const newTodo: Todo = {
      id: generateId(),
      text,
      color,
      createdAt: Date.now(),
      x: targetX, 
      y: targetY, 
      rotation: 0,
      zIndex: maxZIndex + 1,
      isLarge
    };

    setTodos(prev => [...prev, newTodo]);
    setMaxZIndex(prev => prev + 1);
  };

  const handleUpdatePosition = (id: string, x: number, y: number, pointer: { x: number, y: number }) => {
    if (trashRef.current) {
        const trashRect = trashRef.current.getBoundingClientRect();
        if (
            pointer.x >= trashRect.left - 20 &&
            pointer.x <= trashRect.right + 20 &&
            pointer.y >= trashRect.top - 20 &&
            pointer.y <= trashRect.bottom + 20
        ) {
            handleDelete(id);
            setIsHoveringTrash(false);
            return;
        }
    }

    setTodos(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
    setIsHoveringTrash(false); 
  };

  const handleBringToFront = (id: string) => {
    setMaxZIndex(prev => prev + 1);
    setTodos(prev => prev.map(t => t.id === id ? { ...t, zIndex: maxZIndex + 1 } : t));
  };

  const handleComplete = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    setTodos(prev => prev.filter(t => t.id !== id));

    const completedItem: CompletedTodo = {
      id: todo.id,
      text: todo.text,
      color: todo.color,
      createdAt: todo.createdAt,
      completedAt: Date.now(),
      isLarge: todo.isLarge
    };
    setCompletedTodos(prev => [completedItem, ...prev]);
  };

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleOrganize = () => {
    setTodos(prev => {
        // Sort by size (small first), then by date for stable sort
        const small = prev.filter(t => !t.isLarge).sort((a,b) => b.createdAt - a.createdAt);
        const large = prev.filter(t => t.isLarge).sort((a,b) => b.createdAt - a.createdAt);

        const startY = 150;
        const offsetY = 45;
        
        // Small pile on the left
        const smallUpdated = small.map((t, i) => ({
            ...t,
            x: 80 + (Math.random() * 2),
            y: startY + (i * offsetY),
            rotation: (Math.random() * 1) - 0.5,
            zIndex: 100 + i
        }));

        // Large pile on the right (approx 400px offset from left)
        const largeUpdated = large.map((t, i) => ({
            ...t,
            x: 400 + (Math.random() * 2),
            y: startY + (i * offsetY),
            rotation: (Math.random() * 1) - 0.5,
            zIndex: 100 + small.length + i
        }));

        return [...smallUpdated, ...largeUpdated];
    });
    setMaxZIndex(100 + todos.length);
  };

  const getBackgroundStyle = () => {
    switch (theme) {
        case 'minimal': return { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' };
        case 'cartoon': return { backgroundColor: '#7DD3FC' }; // Sky blue
        case 'retro': 
        default: return { backgroundColor: '#4a6b5d' };
    }
  };

  const headerDate = getHeaderDateParts(currentTime);

  return (
    <div 
        ref={containerRef}
        className={cn("relative w-screen h-screen overflow-hidden transition-colors duration-500", theme === 'cartoon' ? "font-patrick" : "")}
        style={getBackgroundStyle()}
        onPointerMove={(e) => {
            if (trashRef.current) {
                const rect = trashRef.current.getBoundingClientRect();
                const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
                setIsHoveringTrash(dist < 150);
            }
        }}
    >
      {/* Retro Vignette */}
      {theme === 'retro' && (
          <div className="absolute inset-0 pointer-events-none" 
            style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)' }}
          />
      )}

      {/* Theme Switcher - Invisible Hover Zone at Top Center */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 pt-2 pb-12 px-32 opacity-0 hover:opacity-100 transition-opacity duration-300 flex justify-center">
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/20 shadow-lg cursor-pointer">
            <button 
                onClick={() => setTheme('retro')}
                className={cn("p-2 rounded-full transition-all", theme === 'retro' ? "bg-white/90 text-[#4a6b5d] shadow-sm" : "text-white/70 hover:bg-white/20")}
                title="Retro Mode"
            >
                <Palette size={18} />
            </button>
            <button 
                onClick={() => setTheme('minimal')}
                className={cn("p-2 rounded-full transition-all", theme === 'minimal' ? "bg-white/90 text-slate-500 shadow-sm" : "text-white/70 hover:bg-white/20")}
                title="Minimal Mode"
            >
                <Monitor size={18} />
            </button>
            <button 
                onClick={() => setTheme('cartoon')}
                className={cn("p-2 rounded-full transition-all", theme === 'cartoon' ? "bg-white/90 text-orange-500 shadow-sm" : "text-white/70 hover:bg-white/20")}
                title="Cartoon Mode"
            >
                <Sun size={18} />
            </button>
        </div>
      </div>

      {/* Header Info */}
      <div className={cn(
          "absolute top-16 left-1/2 transform -translate-x-1/2 pointer-events-none select-none text-center z-0 transition-colors duration-500",
          theme === 'retro' ? "text-[#1a2620]" : "text-slate-800"
      )}>
        <div className="mb-6 flex flex-col items-center justify-center">
             <h2 className={cn(
                "text-2xl font-bold tracking-widest",
                theme === 'retro' ? "font-typewriter opacity-50" : "",
                theme === 'minimal' ? "font-sans font-light tracking-[0.5em] opacity-40" : "",
                theme === 'cartoon' ? "font-patrick text-3xl text-white opacity-90 drop-shadow-[2px_2px_0px_black]" : ""
            )}>
                {headerDate.dateLine.toUpperCase()}
            </h2>
             <h2 className={cn(
                "text-xl font-bold tracking-widest mt-1",
                theme === 'retro' ? "font-typewriter opacity-40" : "",
                theme === 'minimal' ? "font-sans font-light tracking-[0.3em] opacity-30" : "",
                theme === 'cartoon' ? "font-patrick text-2xl text-white opacity-80 drop-shadow-[2px_2px_0px_black]" : ""
            )}>
                {headerDate.weekdayLine.toUpperCase()}
            </h2>
        </div>
        
        <h1 className={cn(
            "text-8xl font-bold tracking-tighter leading-none",
             theme === 'retro' ? "font-typewriter opacity-20" : "",
             theme === 'minimal' ? "font-sans font-thin opacity-10" : "",
             theme === 'cartoon' ? "font-patrick text-white opacity-60 drop-shadow-[4px_4px_0px_black]" : ""
        )}>
            {formatTime(currentTime)}
        </h1>
      </div>

      {/* Top Left Controls */}
      <div className="absolute top-8 left-8 z-30">
        <button
            onClick={handleOrganize}
            className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-all group",
                theme === 'retro' && "bg-[#d1cbc1] hover:bg-[#e3ded1] text-[#4a4238] shadow-[2px_2px_5px_rgba(0,0,0,0.2)] border border-[#b8afa1] font-typewriter",
                theme === 'minimal' && "bg-white/80 hover:bg-white text-slate-600 shadow-sm backdrop-blur border border-white/50",
                theme === 'cartoon' && "bg-[#FFDE59] hover:bg-[#ffe580] text-black border-2 border-black shadow-[2px_2px_0px_black] active:shadow-none active:translate-y-1"
            )}
            title="Organize"
        >
            <LayoutGrid size={24} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Trash Can (Bottom Left) */}
      <div 
        ref={trashRef}
        className={cn(
            "absolute bottom-8 left-8 z-20 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
            theme === 'retro' && "border-4",
            theme === 'cartoon' && "border-4 border-black bg-white",
            isHoveringTrash 
                ? "opacity-80 scale-100" 
                : "opacity-0 scale-90",
            // Theme colors
            (theme === 'retro' && isHoveringTrash) && "bg-red-900/10 border-red-800/30",
            (theme === 'minimal' && isHoveringTrash) && "bg-red-50/50 border-red-200 text-red-400",
            (theme === 'cartoon' && isHoveringTrash) && "bg-red-400 shadow-[4px_4px_0px_black]"
        )}
      >
        <Trash2 
            size={40} 
            className={cn(
                theme === 'retro' ? "text-red-900/60" : "text-red-500",
                theme === 'cartoon' ? "text-black" : ""
            )}
        />
      </div>

      {/* Desk Area (Active Todos) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-full pointer-events-auto">
            {todos.map(todo => (
                <PaperStrip 
                    key={todo.id} 
                    todo={todo} 
                    theme={theme}
                    onComplete={handleComplete}
                    onUpdatePosition={handleUpdatePosition}
                    onBringToFront={handleBringToFront}
                />
            ))}
        </div>
      </div>

      {/* Printer Interface */}
      <Printer onPrint={handlePrint} theme={theme} />

      {/* Storage Drawer */}
      <StorageDrawer 
        completedTodos={completedTodos} 
        isOpen={drawerOpen} 
        setIsOpen={setDrawerOpen} 
        theme={theme}
      />

    </div>
  );
};

export default App;