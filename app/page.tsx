'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconGridDots, IconPlus, IconLogin, IconArrowRight } from '@tabler/icons-react';
import { getBackendAuthToken, getRoomsApiUrl } from '@/lib/collaboration/env';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const joinError = searchParams.get('joinError');
    if (joinError === 'room-not-found') {
      setErrorMessage('Room not found. Create a room first, then share the room ID to join.');
    }
  }, [searchParams]);

  const createNewRoom = async () => {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const token = getBackendAuthToken();
      const response = await fetch(getRoomsApiUrl(), {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`create-room-failed:${response.status}`);
      }

      const payload: { id: string } = await response.json();
      router.push(`/room/${payload.id}`);
      return;
    } catch {
      const fallbackRoomId = generateRoomId();
      setErrorMessage('Backend unavailable, using local fallback room id.');
      router.push(`/room/${fallbackRoomId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = roomId.trim();
    if (!normalized) {
      return;
    }

    setIsJoining(true);
    setErrorMessage(null);

    try {
      const token = getBackendAuthToken();
      const response = await fetch(`${getRoomsApiUrl()}/${encodeURIComponent(normalized)}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 404) {
        setErrorMessage('Room does not exist. Create a room first.');
        return;
      }

      if (!response.ok) {
        throw new Error(`join-room-validation-failed:${response.status}`);
      }

      router.push(`/room/${normalized}`);
    } catch {
      setErrorMessage('Unable to validate room right now. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const generateRoomId = () => {
    const adjectives = ['happy', 'sunny', 'cosmic', 'bright', 'calm', 'swift', 'cool', 'warm'];
    const nouns = ['panda', 'tiger', 'eagle', 'ocean', 'mountain', 'star', 'wave', 'cloud'];
    const random = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}-${noun}-${random}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50 font-display text-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <IconGridDots size={24} stroke={2.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">PixelCollab</h1>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold tracking-tight text-slate-800">
            Collaborate in Real-Time
          </h2>
          <p className="text-lg text-slate-600">
            Create a new room or join an existing one to start drawing together
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={createNewRoom}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
          >
            <IconPlus size={24} stroke={2.5} />
            {isCreating ? 'Creating...' : 'Create New Room'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">or</span>
            </div>
          </div>

          <form onSubmit={joinRoom} className="space-y-3">
            <div className="relative">
              <IconLogin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} stroke={2} />
              <input
                type="text"
                placeholder="Enter room ID..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition-colors text-base font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!roomId.trim() || isJoining}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-base font-bold shadow-md hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
              <IconArrowRight size={20} stroke={2.5} />
            </button>
          </form>
        </div>
        {errorMessage ? (
          <p className="text-sm text-amber-600 text-center">{errorMessage}</p>
        ) : null}

        <div className="pt-8 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">Real-Time</div>
              <div className="text-xs text-slate-600 mt-1">Collaboration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Unlimited</div>
              <div className="text-xs text-slate-600 mt-1">Canvas Size</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Instant</div>
              <div className="text-xs text-slate-600 mt-1">Sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
