const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const registerChatSocket = require('./sockets/chat.socket');

async function start() {
  await connectDB();

  const server = http.createServer(app);

  // Socket.IO takes the role Django Channels + Redis play in the
  // Django doc — real-time chat over the same HTTP server, no ASGI
  // swap required the way Channels needs Daphne/Uvicorn.
  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  registerChatSocket(io);

  server.listen(env.port, () => {
    console.log(`[server] IdleX API running on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
