'use client';

import { IconPlus, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useColorStore } from '@/stores/providers/color-store-provider';
import type { ColorSwatch } from '@/stores/color-store';
import {
  Dialog,
  DialogTrigger,
  Button,
  Popover,
  ColorArea as AriaColorArea,
  ColorSlider
} from 'react-aria-components';
import { parseColor } from '@react-stately/color';
import type { Color } from '@react-stately/color';
import './ColorPicker.css';

export default function ColorsPalette() {
  const { activeColor, allColors, setActiveColor, addCustomColor } = useColorStore();
  const [pickerColor, setPickerColor] = useState<Color>(parseColor('hsl(0, 100%, 50%)'));

  const handleColorClick = (color: ColorSwatch) => {
    setActiveColor(color);
  };

  const handleColorChange = (color: Color) => {
    setPickerColor(color);
  };

  const handleColorSave = () => {
    // Add validation limit 10 colors in palette, show error toast
    if (allColors.length >= 10) {
      alert('You can only add up to 10 colors in the palette.');
      return;
    }

    const hexColor = pickerColor.toString('hex').toUpperCase();
    const newSwatch: ColorSwatch = {
      name: 'Custom',
      value: hexColor,
    };
    addCustomColor(newSwatch);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40">
      {/* Active Color Display */}
      <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
        <div
          className="size-10 rounded-lg border border-slate-200 shadow-inner cursor-pointer relative overflow-hidden group"
          style={{ backgroundColor: activeColor.value }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {activeColor.name}
          </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {activeColor.value}
          </span>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center gap-1.5">
        {allColors.map((color, index) => (
          <button
            key={`${color.value}-${index}`}
            className={`size-8 rounded-md border transition-all duration-200 relative group ${color.bg || ''
              } ${activeColor.value === color.value
                ? 'ring-2 ring-slate-400 ring-offset-2 scale-110'
                : 'hover:scale-110 border-slate-200'
              }`}
            style={!color.bg ? { backgroundColor: color.value } : {}}
            onClick={() => handleColorClick(color)}
            title={`${color.name} - ${color.value}`}
          >
            {activeColor.value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconCheck
                  size={16}
                  stroke={3}
                  className={color.value === '#FFFFFF' ? 'text-slate-700' : 'text-white drop-shadow'}
                />
              </div>
            )}
          </button>
        ))}

        {/* Add Custom Color Button with ColorArea Picker */}
        <DialogTrigger>
          <Button className="size-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all hover:scale-110 outline-none">
            <IconPlus size={16} stroke={2} />
          </Button>
          <Popover className="bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50" placement="top">
            <Dialog className="outline-none">
              {({ close }) => (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-slate-700">Pick a Custom Color</h3>

                  {/* Color Area */}
                  <div className="w-48 h-48 rounded-lg overflow-hidden border border-slate-200">
                    <AriaColorArea
                      value={pickerColor}
                      onChange={handleColorChange}
                      colorSpace="hsl"
                      xChannel="saturation"
                      yChannel="lightness"
                      className="w-full h-full"
                    />
                  </div>

                  {/* Hue Slider */}
                  <div className="w-full h-6 rounded-md overflow-hidden border border-slate-200">
                    <ColorSlider
                      value={pickerColor}
                      onChange={handleColorChange}
                      colorSpace="hsl"
                      channel="hue"
                      className="h-full"
                    />
                  </div>

                  {/* Color Preview and Hex Value */}
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-lg border border-slate-200"
                      style={{ backgroundColor: pickerColor.toString('hex') }}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Preview
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {pickerColor.toString('hex').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleColorSave();
                        close();
                      }}
                      className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Add Color
                    </button>
                    <button
                      onClick={close}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
}
