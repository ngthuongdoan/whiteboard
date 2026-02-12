'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ColorSwatch } from '@/stores/color-store';
import { useColorStore } from '@/stores/providers/color-store-provider';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import Color from 'color';
import { useState } from 'react';
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerSelection, ColorPreview } from './ui/color-picker';

interface ColorsPaletteProps {
  collapsed?: boolean;
}

export default function ColorsPalette({ collapsed = false }: ColorsPaletteProps) {
  const { activeColor, allColors, setActiveColor, addCustomColor } = useColorStore();
  const [pickerColor, setPickerColor] = useState<Parameters<typeof Color>[0]>('#FF0000');
  const [isOpen, setIsOpen] = useState(false);

  const handleColorClick = (color: ColorSwatch) => {
    setActiveColor(color);
  };

  const handleColorSave = () => {
    // Add validation limit 10 colors in palette, show error toast
    if (allColors.length >= 10) {
      alert('You can only add up to 10 colors in the palette.');
      return;
    }

    const newSwatch: ColorSwatch = {
      name: 'Custom',
      value: Color(pickerColor).hex().toUpperCase(),
    };
    addCustomColor(newSwatch);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 transition-transform duration-300 ${collapsed ? 'translate-y-32' : 'translate-y-0'}`}
    >
      {/* Active Color Display */}
      <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
        <div
          className="size-10 rounded-lg border border-slate-200 shadow-inner cursor-pointer relative overflow-hidden group"
          style={{ backgroundColor: Color(activeColor.value).hex() }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {activeColor.name}
          </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {Color(activeColor.value).hex().toUpperCase()}
          </span>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center gap-1.5">
        {allColors.map((color, index) => (
          <Button
            key={`${color.value}-${index}`}
            size={"icon"}
            className={`transition-all duration-200 relative group ${activeColor.value === color.value
                ? 'ring-2 ring-slate-400 ring-offset-2 scale-110'
                : 'hover:scale-110 border-slate-200'
              }`}
            style={{ backgroundColor: Color(color.value).hex() }}
            onClick={() => handleColorClick(color)}
            title={`${color.name} - ${color.value}`}
          >
            {activeColor.value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconCheck
                  size={16}
                  stroke={3}
                  className={Color(color.value).hex().toUpperCase() === '#FFFFFF' ? 'text-slate-700' : 'text-white drop-shadow'}
                />
              </div>
            )}
          </Button>
        ))}

        {/* Add Custom Color Button with ColorPicker */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="size-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all hover:scale-110">
              <IconPlus size={16} stroke={2} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-fit bg-white">
            <DialogHeader>
              <DialogTitle>Pick a Custom Color</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <ColorPicker
                value={pickerColor}
                onChange={value => setPickerColor(Color(value).hex().toUpperCase())}
                className="h-auto w-64"
              >
                <ColorPickerSelection className="h-40 rounded-lg" />
                <ColorPickerHue />
                <ColorPickerAlpha />
                <div className="flex items-center gap-2">
                  <ColorPickerEyeDropper />
                  <ColorPickerFormat />
                  <ColorPreview />
                </div>
              </ColorPicker>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleColorSave}
                  className="flex-1"
                >
                  Add Color
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
