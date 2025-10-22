const { mongoose, model } = require("mongoose");

const chatSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = model("chats", chatSchema);
module.exports = { Chat };

