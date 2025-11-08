const {Router} = require('express');
const { Chat } = require('../models/chatSchema');
const { requireAuth } = require('../middlewares/auth');
const router = Router();
const { Message } = require('../models/messageSchema');
const { io } = require('../server');

router.get("/chats/:chatId", requireAuth("token"), async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate("participants", "fullname email");

  if (!chat) return res.status(404).json({ error: "Chat not found" });

  res.json(chat);
});

router.get("/chats/:chatId/messages", requireAuth("token"), async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const messages = await Message.find({ chat: req.params.chatId })
    .populate("author", "fullname email");

  const messagesWithReadStatus = messages.map(msg => ({
    ...msg.toObject(),
    isUnread: !msg.readBy.includes(req.user._id)
  }));
  
  res.json(messagesWithReadStatus);
});


router.post("/chats/:chatId/messages", requireAuth("token"), async(req,res)=>{
  const message = await Message.create({
    chat: req.params.chatId,
    content: req.body.content,
    attachments: req.body.attachments || [],
    author: req.user._id,
    readBy: [req.user._id]
  });
  const populatedMsg = await Message.findById(message._id)
  .populate("author", "fullname email");
  io.to(req.params.chatId).emit("newMessage", populatedMsg);

  res.json(populatedMsg);
});

router.post("/messages/:messageId/read", requireAuth("token"), async(req,res)=>{
  await Message.findByIdAndUpdate(
    req.params.messageId,
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success:true });
});

router.get("/chats/message-personal/:projectId/:memberId", requireAuth("token"), async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    let chat = await Chat.findOne({ project: projectId, isGroupChat: false, participants: { $all: [req.user._id, memberId] } })
      .populate("participants", "fullname email");

    if (!chat){
        chat = await Chat.create({
        participants: [req.user._id, memberId],
        isGroupChat: false,
      });
      await chat.populate("participants", "fullname email");
      return res.json(chat);
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving personal chat" });
  }
});



module.exports = {router};