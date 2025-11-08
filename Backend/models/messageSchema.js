const { mongoose, model } = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chats",
    required: true
  },
  content: String,
  attachments: [{
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }],
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: 1 });

const Message = model("messages", messageSchema);
module.exports = { Message };
