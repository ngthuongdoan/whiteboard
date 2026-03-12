import { create } from "zustand";

export type DrawingTool = "pencil" | "eraser";

interface DrawingToolState {
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
}

export const useDrawingToolStore = create<DrawingToolState>((set) => ({
  activeTool: "pencil",
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
