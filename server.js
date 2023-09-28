const env = require('dotenv').config()
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const connection = require('./infrastructure/connection')
const Message = require('./model/Message')
const { authenticate } = require('./authenticate')
const cors = require('cors')

const PORT = process.env.PORT || 3000

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

const phoneToSocketMap = {};

const db = connection.db()
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB:'))
db.once('open', () => {

  io.use(authenticate)

  io.on('connection', (socket) => {
    phoneToSocketMap[socket.user.phone] = socket.id
  
    socket.emit('user-info', socket.user)
    
    Message.find({ $or: [{ 'sender.phone': socket.user.phone }, { 'target': socket.user.phone }] })
    .sort({ timestamp: 1 })
    .then((messages) => {
      if (messages.length) {
        socket.emit('initial-messages', messages);
      }
    })
    .catch((error) => {
      console.error('Erro ao recuperar mensagens:', error);
    });
  
    socket.on('message', async ({target, message}) => {
      const targetSocket = phoneToSocketMap[target]
      const newMessage = new Message({
        sender: socket.user,
        target,
        content: message
      });

      await newMessage.save();

      console.log(newMessage)
      io.to(targetSocket).emit('message', newMessage)
    });
  });
  
  server.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`);
  });
})