const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true, index: true},
    passwordHash: {type: String, required: true, select: false},
    friends: [String]
});

module.exports = mongoose.model('User', userSchema);