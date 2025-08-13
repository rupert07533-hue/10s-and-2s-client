import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { json } from 'body-parser';
import { setupSocket } from './socket';
import authRouter from './api/auth';

const app = express();
app.use(json());
app.use('/auth', authRouter);

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' }
});

setupSocket(io);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
