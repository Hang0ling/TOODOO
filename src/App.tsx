import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Trash2, Palette, Monitor, Sun } from 'lucide-react';
import { Todo, CompletedTodo, PaperColor, Theme } from './types';
import { generateId, getRandomRotation, formatTime, getHeaderDateParts, cn, checkIntersection } from './utils';
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
  
  // Organization State: 0 (Messy), 1 (Columns), 2 (Colors), 3 (Grid)
  const [organizeMode, setOrganizeMode] = useState<number>(0);

  // Selection Box State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const selectionStartRef = useRef<{ x: number, y: number } | null>(null);

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
      isLarge,
      isSelected: false
    };

    setTodos(prev => [...prev, newTodo]);
    setMaxZIndex(prev => prev + 1);
  };

  // Check trash hover during drag
  const handleDrag = (point: { x: number, y: number }) => {
     if (trashRef.current) {
        const rect = trashRef.current.getBoundingClientRect();
        // Use a slightly larger radius for easier activation while dragging
        const dist = Math.hypot(point.x - (rect.left + rect.width/2), point.y - (rect.top + rect.height/2));
        setIsHoveringTrash(dist < 100);
     }
  };

  // Group Drag Logic
  const handleUpdatePosition = (id: string, x: number, y: number, pointer: { x: number, y: number }, delta: { x: number, y: number }) => {
    // Check Trash for Drop Action
    if (trashRef.current) {
        const trashRect = trashRef.current.getBoundingClientRect();
        if (
            pointer.x >= trashRect.left - 20 &&
            pointer.x <= trashRect.right + 20 &&
            pointer.y >= trashRect.top - 20 &&
            pointer.y <= trashRect.bottom + 20
        ) {
            // Delete logic for group or single
            const todo = todos.find(t => t.id === id);
            if (todo && todo.isSelected) {
                // Delete all selected
                const selectedIds = todos.filter(t => t.isSelected).map(t => t.id);
                selectedIds.forEach(delId => handleDelete(delId));
            } else {
                handleDelete(id);
            }
            setIsHoveringTrash(false);
            return;
        }
    }

    setTodos(prev => {
        const movingTodo = prev.find(t => t.id === id);
        // If the moved item wasn't selected, just move it alone (and maybe deselect others? keeping simple for now)
        if (!movingTodo?.isSelected) {
            return prev.map(t => t.id === id ? { ...t, x, y } : t);
        }

        // If it IS selected, move all selected items by the same delta
        return prev.map(t => {
            if (t.isSelected) {
                // Determine if this is the dragged item (use absolute pos) or a follower (use delta)
                if (t.id === id) {
                     return { ...t, x, y };
                } else {
                     return { ...t, x: t.x + delta.x, y: t.y + delta.y };
                }
            }
            return t;
        });
    });
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
    // Cycle: 0 -> 1 -> 2 -> 3 -> 1 (skipping 0 after start)
    const nextMode = organizeMode === 0 ? 1 : (organizeMode % 3) + 1;
    setOrganizeMode(nextMode);

    setTodos(prev => {
        let sorted = [...prev];
        const spacing = 80; // Increased spacing
        const startY = 120;
        
        // Mode 1: Columns (Small Left, Large Right)
        if (nextMode === 1) {
            const small = prev.filter(t => !t.isLarge).sort((a,b) => b.createdAt - a.createdAt);
            const large = prev.filter(t => t.isLarge).sort((a,b) => b.createdAt - a.createdAt);

            const smallUpdated = small.map((t, i) => ({
                ...t,
                x: 80 + (Math.random() * 2),
                y: startY + (i * spacing),
                rotation: (Math.random() * 1) - 0.5,
                zIndex: 100 + i
            }));

            const largeUpdated = large.map((t, i) => ({
                ...t,
                x: 450 + (Math.random() * 2), // Shifted right
                y: startY + (i * spacing),
                rotation: (Math.random() * 1) - 0.5,
                zIndex: 100 + small.length + i
            }));
            return [...smallUpdated, ...largeUpdated];
        }

        // Mode 2: Colors (Pink, Yellow, Blue, White)
        if (nextMode === 2) {
             const colors: PaperColor[] = ['pink', 'yellow', 'blue', 'white'];
             // Group
             const groups: Record<PaperColor, Todo[]> = { pink: [], yellow: [], blue: [], white: [] };
             prev.forEach(t => groups[t.color].push(t));

             let result: Todo[] = [];
             let globalIndex = 0;
             
             colors.forEach((c, colIndex) => {
                 const group = groups[c].sort((a, b) => b.createdAt - a.createdAt);
                 const colX = 100 + (colIndex * 260); // 4 columns
                 
                 const updated = group.map((t, i) => ({
                     ...t,
                     x: colX,
                     y: startY + (i * spacing),
                     rotation: 0,
                     zIndex: 100 + globalIndex++
                 }));
                 result = [...result, ...updated];
             });
             return result;
        }

        // Mode 3: Grid (Tiled)
        if (nextMode === 3) {
            sorted.sort((a,b) => b.createdAt - a.createdAt);
            const gridWidth = window.innerWidth - 100;
            let currentX = 100;
            let currentY = startY;
            const rowHeight = 280; // Max height of note

            return sorted.map((t, i) => {
                const width = t.isLarge ? 320 : 256;
                // Check overflow
                if (currentX + width > gridWidth) {
                    currentX = 100;
                    currentY += rowHeight;
                }
                
                const update = {
                    ...t,
                    x: currentX,
                    y: currentY,
                    rotation: 0,
                    zIndex: 100 + i
                };
                currentX += width + 40; // Gap
                return update;
            });
        }

        return prev;
    });
    setMaxZIndex(100 + todos.length);
  };

  // --- SELECTION BOX LOGIC ---

  const handlePointerDown = (e: React.PointerEvent) => {
     // Only start selection if clicking directly on the background
     if (e.target === containerRef.current) {
        setIsSelecting(true);
        const rect = containerRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        selectionStartRef.current = { x: startX, y: startY };
        setSelectionBox({ x: startX, y: startY, w: 0, h: 0 });
        
        // Deselect all unless shift key? Let's just deselect for simplicity
        setTodos(prev => prev.map(t => ({...t, isSelected: false})));
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      // Handle Trash Hover (Fallback if not dragging note)
      if (trashRef.current) {
        const rect = trashRef.current.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
        setIsHoveringTrash(dist < 150);
      }

      // Handle Selection Box
      if (isSelecting && selectionStartRef.current && containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         const currentX = e.clientX - rect.left;
         const currentY = e.clientY - rect.top;

         const start = selectionStartRef.current;
         const newX = Math.min(start.x, currentX);
         const newY = Math.min(start.y, currentY);
         const newW = Math.abs(currentX - start.x);
         const newH = Math.abs(currentY - start.y);

         setSelectionBox({ x: newX, y: newY, w: newW, h: newH });

         // Real-time selection update
         setTodos(prev => prev.map(t => {
             const w = t.isLarge ? 320 : 256;
             const h = t.isLarge ? 240 : 160; // approx heights
             const isOverlapping = checkIntersection(
                 { x: newX, y: newY, w: newW, h: newH },
                 { x: t.x, y: t.y, w, h }
             );
             return { ...t, isSelected: isOverlapping };
         }));
      }
  };

  const handlePointerUp = () => {
      setIsSelecting(false);
      setSelectionBox({ x: 0, y: 0, w: 0, h: 0 });
      selectionStartRef.current = null;
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
        className={cn("relative w-screen h-screen overflow-hidden transition-colors duration-500 touch-none", theme === 'cartoon' ? "font-patrick" : "")}
        style={getBackgroundStyle()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
    >
      {/* Retro Vignette */}
      {theme === 'retro' && (
          <div className="absolute inset-0 pointer-events-none" 
            style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)' }}
          />
      )}

      {/* Selection Box Visual */}
      {isSelecting && (
          <div 
            className="absolute border-2 border-blue-400 bg-blue-400/20 z-50 pointer-events-none"
            style={{
                left: selectionBox.x,
                top: selectionBox.y,
                width: selectionBox.w,
                height: selectionBox.h
            }}
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
            <span className="absolute -bottom-6 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none bg-black/50 text-white px-2 rounded">
                {organizeMode === 0 ? "Messy" : organizeMode === 1 ? "Columns" : organizeMode === 2 ? "Color" : "Grid"}
            </span>
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
                    onDrag={handleDrag}
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