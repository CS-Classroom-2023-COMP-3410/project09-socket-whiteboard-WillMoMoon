const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

let boardState = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send current board state to new client
    socket.emit('boardState', boardState);

    // Listen for drawing actions
    socket.on('draw', (data) => {
        boardState.push(data);
        socket.broadcast.emit('draw', data);  // Broadcast to others
    });

    // Listen for board clear
    socket.on('clearBoard', () => {
        boardState = [];
        io.emit('clearBoard');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
