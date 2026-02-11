"use client";

import { useMousePosition, type Position } from "@/hooks/use-mouse-position";
import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";

interface MousePositionStoreValue {
  mouse: Position;
  trackingRef: RefObject<HTMLDivElement>;
}

const MousePositionStoreContext = createContext<
  MousePositionStoreValue | undefined
>(undefined);

interface MousePositionStoreProviderProps {
  children: ReactNode;
}

export function MousePositionStoreProvider({
  children,
}: MousePositionStoreProviderProps) {
  const [mouse, trackingRef] = useMousePosition<HTMLDivElement>();

  return (
    <MousePositionStoreContext.Provider value={{ mouse, trackingRef }}>
      {children}
    </MousePositionStoreContext.Provider>
  );
}

export function useMousePositionStore() {
  const context = useContext(MousePositionStoreContext);

  if (!context) {
    throw new Error(
      "useMousePositionStore must be used within MousePositionStoreProvider",
    );
  }

  return context;
}
