'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const router = useRouter();
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (data: { roomCode: string }) => {
      router.push(`/room/${data.roomCode}`);
    };

    const onRoomState = () => {
      const code = roomCode.trim().toUpperCase();
      if (code) {
        router.push(`/room/${code}`);
      }
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
    };

    socket.on('room-created', onRoomCreated);
    socket.on('room-state', onRoomState);
    socket.on('error', onError);

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('room-state', onRoomState);
      socket.off('error', onError);
    };
  }, [socket, router, roomCode]);

  const handleCreate = () => {
    if (!username.trim()) {
      setError('You need cave name!');
      return;
    }
    setError(null);
    socket.emit('create-room', { username: username.trim() });
  };

  const handleJoin = () => {
    if (!username.trim()) {
      setError('You need cave name!');
      return;
    }
    if (!roomCode.trim()) {
      setError('You need room code!');
      return;
    }
    setError(null);
    socket.emit('join-room', { roomCode: roomCode.trim().toUpperCase(), username: username.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-cave-gold mb-2 tracking-tight"
            style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
            CAVEMAN
          </h1>
          <h2 className="text-3xl font-bold text-cave-light tracking-widest">
            POETRY
          </h2>
          <p className="text-cave-muted mt-3 text-sm">
            Use small words. Describe big thing. Win hunt.
          </p>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm text-cave-muted mb-1 uppercase tracking-wider">
            Your Cave Name
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter name..."
            maxLength={20}
            className="w-full bg-cave-card border-2 border-cave-muted/30 rounded-xl px-4 py-3 text-xl text-cave-light placeholder-cave-muted/50 focus:outline-none focus:border-cave-gold/50 transition-colors"
            onKeyDown={e => {
              if (e.key === 'Enter' && mode === 'menu') handleCreate();
              if (e.key === 'Enter' && mode === 'join') handleJoin();
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-bonk-red/20 border border-bonk-red/40 rounded-lg text-bonk-red text-center text-sm">
            {error}
          </div>
        )}

        {mode === 'menu' ? (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              className="w-full py-4 rounded-xl text-xl font-bold bg-cave-gold text-cave-bg hover:bg-cave-gold/80 transition-all active:scale-[0.98] shadow-lg"
            >
              Make New Cave
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 rounded-xl text-xl font-bold btn-stone text-cave-light"
            >
              Join Cave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-cave-muted mb-1 uppercase tracking-wider">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="w-full bg-cave-card border-2 border-cave-muted/30 rounded-xl px-4 py-3 text-3xl text-center text-cave-gold font-bold tracking-[0.4em] placeholder-cave-muted/30 focus:outline-none focus:border-cave-gold/50 transition-colors uppercase"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleJoin();
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-xl text-xl font-bold bg-cave-green text-white hover:bg-cave-green/80 transition-all active:scale-[0.98] shadow-lg"
            >
              Enter Cave
            </button>
            <button
              onClick={() => setMode('menu')}
              className="w-full py-3 rounded-xl text-sm text-cave-muted hover:text-cave-light transition-colors"
            >
              Go back
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 text-cave-muted/50 text-xs">
          Talk like caveman. Win big. BONK cheaters.
        </div>
      </div>
    </div>
  );
}
