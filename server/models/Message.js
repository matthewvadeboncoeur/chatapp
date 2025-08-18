const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
sender: {type: String, required: true},
    receiver: {type: String, required: true},
    text: {type: String, required: true}
});

module.exports = mongoose.model('Message', messageSchema);