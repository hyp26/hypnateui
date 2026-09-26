import { io, Socket } from "socket.io-client";

/*
 * Shared Socket.IO client for the Hypnate backend.
 *
 * - Reuses the same environment configuration as the authenticated
 *   Axios client (src/lib/api.ts): REACT_APP_API_URL. When unset, the
 *   socket connects to the current origin, exactly like the relative
 *   API requests do. No hardcoded production URLs.
 * - Authentication relies on the existing HttpOnly "accessToken"
 *   cookie: the browser includes it in the Socket.IO handshake
 *   automatically because of "withCredentials". The backend verifies
 *   it in its io.use() middleware. No localStorage tokens.
 * - A single shared instance is reused, so mounting the Conversations
 *   screen or switching conversations never creates duplicate
 *   connections.
 */

const SOCKET_URL = process.env.REACT_APP_API_URL || undefined;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
