const { Router } = require("express");
const { Project } = require("../models/projectSchema");
const { Task } = require("../models/taskSchema");
const { requireAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chatSchema");
const { Invite } = require("../models/inviteSchema");

const router = Router();

router.post("/create", requireAuth("token"), async (req, res) => {
  try {
    const { name, description, startDate, endDate, priority } = req.body;
    const createdBy = req.user._id;

    if (!name || !startDate) {
      return res.status(400).json({ message: "Name and start date are required" });
    }

    // Create chat for the project
    const chat = await Chat.create({ project: null, task: null }); 

    // Create project with only creator as initial member
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      priority,
      createdBy,
      teamMembers: [createdBy],
      chat: chat._id
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating project" });
  }
});




module.exports = { router };