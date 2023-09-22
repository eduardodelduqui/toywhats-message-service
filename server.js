const env = require('dotenv').config()
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const { authenticate } = require('./authenticate')
const cors = require('cors')

const PORT = env.parsed.PORT || 3000

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

const phoneToSocketMap = {};


io.use(authenticate)

io.on('connection', (socket) => {
  phoneToSocketMap[socket.user.phone] = socket.id

  socket.emit('user-info', socket.user)

  socket.on('message', ({target, message}) => {
    const targetSocket = phoneToSocketMap[target]
    io.to(targetSocket).emit('message', {
      sender: socket.user,
      message
    })
  });
});

server.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});