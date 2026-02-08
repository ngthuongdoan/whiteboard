import { IconGridDots, IconShare } from '@tabler/icons-react';

interface HeaderProps {
  roomId?: string;
}

export default function Header({ roomId }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
          <IconGridDots size={20} stroke={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-800">PixelCollab</h1>
          <p className="text-[10px] text-primary uppercase tracking-widest font-bold">
            {roomId ? `Room: ${roomId}` : 'Canvas: Fresh Start'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">3 users online</span>
          </div>
          <div className="w-px h-3 bg-slate-300"></div>
          <div className="text-xs font-medium text-slate-400">0 users drawing</div>
        </div>

        <div className="flex items-center -space-x-2">
          <div className="size-8 rounded-full border-2 border-white overflow-hidden bg-indigo-100 ring-1 ring-slate-100" title="Sleepy Sloth">
            <img alt="Avatar 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOvJcMNQXBSFmGYe79M75uBEajoLPLNC8eU7KlFnsK_d9ZGxA5aOVS_u5sdec6EPwFZHlW7j1MVNKSPqVFQTgW5nWxS6hNbMl3AcpUXei-eW89s_YcUAu9MWsWG2Ksb_j7GtGy6mJfr7aLBfnho5XG3xe7gVX7efEjkQ7fKo2cLImuddEVWv7_ezklZ2d7ut9V4PHu324XCgUCejP5xy8rF66emARNJxvCgYM1j1BnExFEUXMFGLu88eCtszHL4nmM_y2dyEnSWYU" width={32} height={32} />
          </div>
          <div className="size-8 rounded-full border-2 border-white overflow-hidden bg-orange-100 ring-1 ring-slate-100" title="Jolly Giraffe">
            <img alt="Avatar 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTheD95B-ExzKiKTeJWqpUhlEPQQBhto58DXXNvOup2PRw8Oqm8kjElUBHvMrqKi0831D4-2GZcdbzlAo2yVhJBkbJ6U4d1aczLCugRL6yNTib-bF_VrwxuGlSr5_-k0G0SbxV63z_aDQrYF-EKiU_NAOZOc55r7KXd1XjA3cKIqQNzEr-qtLdmpAXZbjY4_hx4w3tbDsvvn0gnY64iTNaXX5UTHvrjlos1q7hO8To3JGDfuM3OsRdko1jhL-f-ss3XzIhZhCtexw" width={32} height={32} />
          </div>
          <div className="size-8 rounded-full border-2 border-white overflow-hidden bg-emerald-100 ring-1 ring-slate-100" title="Dapper Duck">
            <img alt="Avatar 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhUhSc7kziQGDuPks5pR6NFRSjXo7fy30YfjlOKm22alpfzato5iheRspdKBmSedzjXwG-aHJkXuXUPQURPZWUGhKhYyNsqDnSrxPdsDPsJPpVrOWVE6NSKWP7RbnuXaE68UDK9wv1K8o-JxLU2kTXemtkzWwGy0Z24ER2hP_5VrDSWMSYyHKHkLIX1K7-rzzqyCH9owP1pYK45jR3a_Shb96BU4CPnz73xDrpgV6ebCJbI9Uvgcu6CaPb7mL2fQKVx6GKUTWidU" width={32} height={32} />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold shadow-sm shadow-primary/20">
          <IconShare size={20} stroke={2} />
          Share
        </button>
      </div>
    </header>
  );
}
