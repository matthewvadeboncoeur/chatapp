// index.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');
const saltRounds = 10;
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

const users = [];
// { username, password}
const messages = [];
// { sender, receiver, text }
const friends = {};
// { user: [list of friends]}

app.use(cors());
app.use(express.json());

app.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({message: "Username already taken"});
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users.push({username, password: hashedPassword});
    res.status(201).json({message: "Sign-up successful!"})
    console.log(users);
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({message: "Wrong username or password!"});
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        return res.status(200).json({message: 'Log-in successful!'});
    } else {
        return res.status(401).json({message: 'Wrong username or password!'});
    }
});

app.post('/messages', (req, res) => {
    const {sender, receiver, text} = req.body;
    messages.push({sender, receiver, text});
    res.status(201).json({message: "send to server success"})
});

app.get('/messages', (req, res) => {
    res.status(200).json(messages);
});

app.post('/friends', (req, res) => {
    const {user, friend} = req.body;
    if (!friends[user]) {
        friends[user] = [];
    }
    if (!friends[user].includes(friend)) {
        friends[user].push(friend);
    }

    res.status(201).json({message: 'friend added successfully'})
    console.log(friends);
});

app.get('/friends/:username', (req, res) => {
    const { username } = req.params;
    const userFriends = friends[username] || [];
    res.status(200).json(userFriends);
});

function createRoom(a, b) {
    return [a,b].sort().join(';');
}

io.on('connection', (socket) => {
    console.log(`a user connected with socket id ${socket.id}`);
    socket.data.currentRoom = null;

    socket.on('join_dm', ({ me, friend }) => {
        const nextRoom = createRoom(me, friend);
        if (socket.data.currentRoom && socket.data.currentRoom !== nextRoom) {
            socket.leave(socket.data.currentRoom);
        }
        socket.join(nextRoom);
        socket.data.currentRoom = nextRoom;
        console.log(`Socket ${socket.id} joined DM room: ${nextRoom}`);
    });

    socket.on('send_message', (message) => {
        messages.push(message);
        const room = createRoom(message.sender, message.receiver);
        io.to(room).emit('message', message);
    })

});

server.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

