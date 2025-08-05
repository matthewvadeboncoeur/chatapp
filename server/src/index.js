// index.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

const users = [];
const messages = []
// { sender, receiver, text }

app.use(cors());
app.use(express.json());

app.post('/signup', (req, res) => {
    const {username, password} = req.body;
    users.push({username, password});
    res.json({message: "SignUp successful!"})
})

app.post('/messages', (req, res) => {
    const {sender, receiver, text} = req.body;
    messages.push({sender, receiver, text});
    res.json({message: "send to server success"})
})

app.get('/messages', (req, res) => {
    res.json(messages);
})

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

