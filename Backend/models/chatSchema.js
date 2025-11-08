const { mongoose, model } = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Chat = model("chats", chatSchema);
module.exports = { Chat };
