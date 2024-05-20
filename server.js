
const { createServer } = require('http');
const express = require('express');
const next = require('next');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  io = socketIo(httpServer);

  io.on('connection', async (socket) => {
    console.log('New client connected');

    socket.on("NEW_MESSAGE", (Payload) => {

    
      console.log("Payload.message", Payload.message);
      socket.to(Payload.chat_channel_id).emit("RECEIVED_NEW_MESSAGE", Payload.message);

  });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

