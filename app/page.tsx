import Canvas from '../components/Canvas';
import Header from '../components/Header';
import Tools from '../components/Tools';
import ColorsPalette from '../components/ColorsPalette';
import Chat from '../components/Chat';
import Coordinate from '../components/Coordinate';

export default function Home() {
  return (
    <div className="bg-slate-50 font-display text-slate-900 overflow-hidden selection:bg-primary/20">
      <Header />
      <Canvas />
      <Tools />
      <ColorsPalette />
      <Coordinate />
      <Chat />
    </div>
  );
}
