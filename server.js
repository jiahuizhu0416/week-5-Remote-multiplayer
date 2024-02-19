const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Tell our Node.js Server to host our P5.JS sketch from the public folder.
app.use(express.static("public"));

// Set up variables to store player positions and trails
let players = {}; // Store position information of all players

// Callback function for what to do when our P5.JS sketch connects and sends us messages
io.on('connection', (socket) => {
    console.log(`New player connected: ${socket.id}`);
    
    // Initialize player state
    players[socket.id] = {
        x: 0,
        y: 0,
        trail: [],
    };

    // Assign initial position
    const playerIndex = Object.keys(players).length;
    switch (playerIndex) {
        case 1:
            players[socket.id].x = 0;
            players[socket.id].y = 0;
            break;
        case 2:
            players[socket.id].x = 540;
            players[socket.id].y = 0;
            break;
        case 3:
            players[socket.id].x = 0;
            players[socket.id].y = 540;
            break;
        case 4:
            players[socket.id].x = 540;
            players[socket.id].y = 540;
            break;
        default:
            // If more than 4 players, you can choose to reassign positions or reject the connection
            break;
    }

    // Notify all players of state update
    io.emit('playersUpdate', players);

    socket.on('move', (data) => {
        // Update player position and trail
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].trail.push({ x: data.x, y: data.y });

        // Broadcast updated game state to all clients
        io.emit('gameStateUpdate', players);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];

        // Broadcast updated game state to all clients
        io.emit('gameStateUpdate', players);
    });
});

function assignInitialPosition(socketId) {
    // Your logic to assign initial position, keeping as is from your example
    const playerIndex = Object.keys(players).length;
    switch (playerIndex) {
        case 1: players[socketId].x = 0; players[socketId].y = 0; break;
        case 2: players[socketId].x = 540; players[socketId].y = 0; break;
        case 3: players[socketId].x = 0; players[socketId].y = 540; break;
        case 4: players[socketId].x = 540; players[socketId].y = 540; break;
        // Handle more than 4 players if needed
    }
}

// Add route handler
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start the server
server.listen(3000,'0.0.0.0',() => {
    console.log('Server is running on port 3000');
});
