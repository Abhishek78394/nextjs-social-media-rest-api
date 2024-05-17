const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
 
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();
 
app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(socket.id + " is connected");
socket.emit("welcome", "Welcome to")
    socket.on("JOIN_ROOM", async (Payload) => {

    })

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
