'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import { defaultColors, type ColorSwatch } from '../color-store';

export interface ColorStoreValue {
  activeColor: ColorSwatch;
  allColors: ColorSwatch[];
  customColors: ColorSwatch[];
  setActiveColor: (color: ColorSwatch) => void;
  addCustomColor: (color: ColorSwatch) => void;
  removeCustomColor: (value: string) => void;
}

export const ColorStoreContext = createContext<ColorStoreValue | undefined>(
  undefined,
);

export interface ColorStoreProviderProps {
  children: ReactNode;
}

export const ColorStoreProvider = ({ children }: ColorStoreProviderProps) => {
  const [activeColor, setActiveColor] = useState<ColorSwatch>(defaultColors[6]);
  const [customColors, setCustomColors] = useState<ColorSwatch[]>([]);
  const allColors = [...defaultColors, ...customColors];

  const addCustomColor = (color: ColorSwatch) => {
    setCustomColors((prev) => [...prev, color]);
    setActiveColor(color);
  };

  const removeCustomColor = (value: string) => {
    setCustomColors((prev) => prev.filter((c) => c.value !== value));
    if (activeColor.value === value) {
      setActiveColor(defaultColors[6]);
    }
  };

  return (
    <ColorStoreContext.Provider
      value={{
        activeColor,
        allColors,
        customColors,
        setActiveColor,
        addCustomColor,
        removeCustomColor,
      }}
    >
      {children}
    </ColorStoreContext.Provider>
  );
};

export const useColorStore = () => {
  const context = useContext(ColorStoreContext);

  if (!context) {
    throw new Error(`useColorStore must be used within ColorStoreProvider`);
  }

  return context;
};
