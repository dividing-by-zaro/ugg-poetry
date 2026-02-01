'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/lib/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();

    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }

    return () => {
      // Don't disconnect on cleanup - we want persistent connection
    };
  }, []);

  return socketRef.current || getSocket();
}
