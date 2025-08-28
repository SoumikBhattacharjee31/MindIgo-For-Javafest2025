const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    // Check if room exists and has capacity
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    
    // Only allow 2 users per room
    if (room.size >= 2) {
      socket.emit('room-full');
      console.log(`Room ${roomId} is full. User ${socket.id} rejected.`);
      return;
    }
    
    socket.join(roomId);
    room.add(socket.id);
    
    console.log(`User ${socket.id} joined room ${roomId}. Room size: ${room.size}`);
    
    // If this is the first user, just wait
    if (room.size === 1) {
      socket.emit('waiting-for-peer');
    } 
    // If this is the second user, start the connection process
    else if (room.size === 2) {
      // Get the first user who joined
      const users = Array.from(room);
      const firstUser = users[0];
      const secondUser = users[1];
      
      // Tell the first user to initiate the call
      io.to(firstUser).emit('initiate-call');
      // Tell the second user that peer joined
      io.to(secondUser).emit('peer-joined');
      
      console.log(`Room ${roomId} now has 2 users. Starting connection process.`);
    }
  });

  socket.on('offer', (offer, roomId) => {
    console.log(`Offer received from ${socket.id} for room ${roomId}`);
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', (answer, roomId) => {
    console.log(`Answer received from ${socket.id} for room ${roomId}`);
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate, roomId) => {
    console.log(`ICE candidate received from ${socket.id} for room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from all rooms and notify others
    rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        console.log(`User ${socket.id} left room ${roomId}. Room size: ${room.size}`);
        
        // Notify remaining user
        socket.to(roomId).emit('peer-disconnected');
        
        // Delete room if empty
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});