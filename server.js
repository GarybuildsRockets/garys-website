const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const CHALLENGES = require('./challenges');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('./'));

const rooms = new Map();

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    // Create Room
    socket.on('create_room', ({ nickname, capacity }) => {
        const code = generateRoomCode();
        const room = {
            code,
            hostId: socket.id,
            capacity: Math.min(Math.max(capacity, 2), 8),
            players: new Map(),
            state: 'LOBBY', // LOBBY, MATCH, ENDED
            currentChallenge: null,
            startTime: null,
            winner: null
        };
        room.players.set(socket.id, { id: socket.id, nickname, status: 'Ready', attemptsLeft: 3 });
        rooms.set(code, room);
        socket.join(code);
        socket.emit('room_created', { code, room: serializeRoom(room) });
    });

    // Join Room
    socket.on('join_room', ({ nickname, code }) => {
        const room = rooms.get(code?.toUpperCase());
        if (!room) return socket.emit('error_msg', 'Room code not found.');
        if (room.state !== 'LOBBY') return socket.emit('error_msg', 'Game already in progress.');
        if (room.players.size >= room.capacity) return socket.emit('error_msg', 'Lobby is full.');

        room.players.set(socket.id, { id: socket.id, nickname, status: 'Ready', attemptsLeft: 3 });
        socket.join(room.code);
        io.to(room.code).emit('room_updated', serializeRoom(room));
    });

    // Host Starts Game
    socket.on('start_game', ({ code, difficulty }) => {
        const room = rooms.get(code);
        if (!room || room.hostId !== socket.id) return;
        if (room.players.size < 2) return socket.emit('error_msg', 'Need at least 2 players.');

        const available = CHALLENGES.filter(c => c.difficulty === difficulty);
        room.currentChallenge = available[Math.floor(Math.random() * available.length)];
        room.state = 'MATCH';
        room.startTime = Date.now() + 3000; // 3-second synchronized countdown

        // Sanitize challenge (remove raw referenceMass sent to clients)
        const clientChallenge = { ...room.currentChallenge };
        delete clientChallenge.referenceMass;

        io.to(room.code).emit('match_started', {
            startTime: room.startTime,
            challenge: clientChallenge
        });
    });

    // Submit Answer
    socket.on('submit_answer', ({ code, mass }) => {
        const room = rooms.get(code);
        if (!room || room.state !== 'MATCH') return;

        const player = room.players.get(socket.id);
        if (!player || player.attemptsLeft <= 0 || room.winner) return;

        const val = parseFloat(mass);
        if (isNaN(val) || val <= 0) {
            return socket.emit('submission_result', { success: false, msg: 'Invalid mass input.' });
        }

        const ref = room.currentChallenge.referenceMass;
        const tol = room.currentChallenge.tolerance;
        const isCorrect = Math.abs(val - ref) <= tol;

        if (isCorrect) {
            // Server-Authoritative Winner Declaration
            room.winner = { id: player.id, nickname: player.nickname, time: Date.now() - room.startTime };
            room.state = 'ENDED';
            player.status = 'WINNER';

            io.to(room.code).emit('match_over', {
                winner: room.winner,
                referenceMass: ref,
                standings: Array.from(room.players.values())
            });
        } else {
            player.attemptsLeft -= 1;
            if (player.attemptsLeft <= 0) {
                player.status = 'ELIMINATED';
            } else {
                player.status = `Incorrect (${player.attemptsLeft} left)`;
            }

            socket.emit('submission_result', {
                success: false,
                attemptsLeft: player.attemptsLeft,
                msg: `Incorrect answer. ${player.attemptsLeft} attempt(s) remaining.`
            });

            io.to(room.code).emit('room_updated', serializeRoom(room));
        }
    });

    socket.on('disconnect', () => {
        for (const [code, room] of rooms.entries()) {
            if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                if (room.players.size === 0) {
                    rooms.delete(code);
                } else {
                    if (room.hostId === socket.id) {
                        room.hostId = room.players.keys().next().value; // Host migration
                    }
                    io.to(code).emit('room_updated', serializeRoom(room));
                }
            }
        }
    });
});

function serializeRoom(room) {
    return {
        code: room.code,
        hostId: room.hostId,
        capacity: room.capacity,
        players: Array.from(room.players.values())
    };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CAD Versus server running on port ${PORT}`));
