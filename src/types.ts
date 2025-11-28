export type PaperColor = 'yellow' | 'pink' | 'blue' | 'white';

export type Theme = 'retro' | 'minimal' | 'cartoon';

export interface Todo {
  id: string;
  text: string;
  color: PaperColor;
  createdAt: number; // Timestamp
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  isLarge: boolean;
  isSelected?: boolean;
}

export interface CompletedTodo extends Omit<Todo, 'x' | 'y' | 'rotation' | 'zIndex' | 'isSelected'> {
  completedAt: number; // Timestamp
}

export interface Folder {
  date: string; // YYYY-MM-DD
  items: CompletedTodo[];
}