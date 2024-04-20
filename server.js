const http = require('http');
const next = require('next');
const socketIo = require('socket.io');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
nextApp.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('Nuova connessione WebSocket');
    socket.on('mobileData', (data) => {
      console.log('Dati ricevuti dal client mobile:', data);
      // Trasmetti i dati al client desktop
      io.emit('barcode_data', data);
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnessione WebSocket');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
