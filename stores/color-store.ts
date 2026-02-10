import Color from "color";

export interface ColorSwatch {
  name: string;
  value: Parameters<typeof Color>[0];
  bg?: string;
}

export const defaultColors: ColorSwatch[] = [
  { name: 'Rose', value: '#F43F5E', bg: 'bg-rose-500' },
  { name: 'Amber', value: '#F59E0B', bg: 'bg-amber-500' },
  { name: 'Yellow', value: '#FACC15', bg: 'bg-yellow-400' },
  { name: 'Emerald', value: '#10B981', bg: 'bg-emerald-500' },
  { name: 'Sky', value: '#0EA5E9', bg: 'bg-sky-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Slate', value: '#0F172A', bg: 'bg-slate-900' },
  { name: 'White', value: '#FFFFFF', bg: 'bg-white' },
];
