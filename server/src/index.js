// index.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = process.env.PORT || 3000;

const users = [];
// { username, password}
const messages = []
// { sender, receiver, text }
const friends = {}
// { user: [list of friends]}

app.use(cors());
app.use(express.json());

app.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.json({message: "Username already taken"});
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users.push({username, password: hashedPassword});
    res.json({message: "Sign-up successful!"})
    console.log(users);
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.json({message: "Wrong username or password!"});
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        return res.json({message: 'Log-in successful!'});
    } else {
        return res.json({message: 'Wrong username or password!'});
    }

    
})

app.post('/messages', (req, res) => {
    const {sender, receiver, text} = req.body;
    messages.push({sender, receiver, text});
    res.json({message: "send to server success"})
})

app.get('/messages', (req, res) => {
    res.json(messages);
})

app.post('/friends', (req, res) => {
    const {user, friend} = req.body;
    if (!friends[user]) {
        friends[user] = [];
    }
    if (!friends[user].includes(friend)) {
        friends[user].push(friend);
    }

    res.json({message: 'friend added successfully'})
    console.log(friends);
})

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

