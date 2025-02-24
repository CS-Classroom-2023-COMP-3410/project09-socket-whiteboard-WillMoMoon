import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearButton = document.getElementById('clearBoard');

let drawing = false;
let currentColor = '#000000';

// Canvas Setup
canvas.width = 800;
canvas.height = 600;

// Helper function to draw
function drawLine(x0, y0, x1, y1, color, emit) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    const w = canvas.width;
    const h = canvas.height;

    socket.emit('draw', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
    });
}

// Mouse Events
let lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    drawLine(lastX, lastY, e.offsetX, e.offsetY, currentColor, true);
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

// Color Picker
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Clear Board
clearButton.addEventListener('click', () => {
    socket.emit('clearBoard');
});

// Socket Listeners
socket.on('draw', (data) => {
    const w = canvas.width;
    const h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
});

socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Load initial board state
socket.on('boardState', (state) => {
    state.forEach(data => {
        const w = canvas.width;
        const h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
    });
});
