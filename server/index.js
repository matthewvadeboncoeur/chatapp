// index.js
require('dotenv').config();
const verifyToken = require('./middleware/verifyToken');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const http = require('http');
const saltRounds = 10;
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const { Schema } = mongoose;
const User = require('./models/User');
const Message = require('./models/Message');

connectDB();

const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;


let refreshTokens = [];

function generateRefreshToken(payload) {
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d"});
    refreshTokens.push(token);
    return token;
}

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
}


app.use(cors());
app.use(express.json());

app.post('/signup', async (req, res) => {
    try {
        const {username, password} = req.body;
        const existing = await User.exists({username: username});
        if (existing)
            return res.json({message: 'Username already taken'});
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            username: username,
            passwordHash: hashedPassword,
            friends: []
        });
        await newUser.save();
        const payload = { username: newUser.username };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5s' });
        const refreshToken = generateRefreshToken(payload);
        res.status(201).json({
            message: "Sign-up successful!",
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.json({message: 'Error creating user!'})
    }
});

app.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({ username: username}).select('+passwordHash');
        if (!user) {
            return res.status(401).json({message: "Wrong username or password!"});
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
            return res.status(401).json({message: 'Wrong username or password!'});
        const payload = { username: user.username };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5s'});
        const refreshToken = generateRefreshToken(payload);
        return res.status(200).json({
            message: 'Log-in successful!',
            accessToken,
            refreshToken
        })
    } catch (err) {
        return res.status(500).json({message: 'Error logging in!'})
    }
});

app.post('/refresh', (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);
    if (!refreshTokens.includes(token)) return res.sendStatus(403);
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ username: user.username });
        res.json({accessToken});
    })
})

app.get('/messages', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;
        const messages = await Message.find({
            $or: [
                { sender: username },
                { receiver: username }
            ]
        });
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: 'Error getting messages!' });
    }
});

app.post('/friends', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;
        const friend = req.body.friend;
        const userDoc = await User.findOne({ username: username});
        if (!userDoc.friends.includes(friend)) {
            userDoc.friends.push(friend);
            await userDoc.save();
            res.json({message: 'Friend added successfully'});
        } else {
            res.json({message: 'Friend already added'})
        }
    } catch (err) {
        res.json({message: 'Failed to add friend'});
    }
});

app.get('/friends', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;
        const userFriends = await User.findOne({ username: username });
        if (!userFriends)
            return res.status(400).json({ message: 'User not found' });
        res.status(200).json(userFriends.friends);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving friends list" });
    }
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

    socket.on('send_message', async (message) => {
        const newMessage = new Message({sender: message.sender, receiver: message.receiver, text: message.text});
        await newMessage.save();
        const room = createRoom(message.sender, message.receiver);
        io.to(room).emit('message', message);
    })

});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
})

