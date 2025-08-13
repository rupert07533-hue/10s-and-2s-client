import { Server, Socket } from 'socket.io';
import { verifyAuth } from './services/auth';
import { createOrJoinLobby, handlePlay } from './game/matchWorker';

export function setupSocket(io: Server) {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      const user = await verifyAuth(token);
      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log('connected', user?.id);

    socket.on('join_lobby', async (payload: { lobbyId?: string, maxPlayers?: number }) => {
      const lobbyId = await createOrJoinLobby(io, socket, user, payload.maxPlayers || 4, payload.lobbyId);
      socket.emit('lobby_update', { lobbyId });
    });

    socket.on('play_cards', async (payload: { matchId: string; cards: string[] }) => {
      try {
        await handlePlay(io, socket, user, payload.matchId, payload.cards);
      } catch (err) {
        socket.emit('error', { message: (err as Error).message });
      }
    });

    socket.on('disconnect', () => {
      console.log('disconnect', user?.id);
    });
  });
}
