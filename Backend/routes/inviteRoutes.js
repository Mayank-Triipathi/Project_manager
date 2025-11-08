const { Router } = require("express");
const { Project } = require("../models/projectSchema");
const { requireAuth } = require("../middlewares/auth");
const router = Router();
const { Invite } = require("../models/inviteSchema");
const {User} = require("../models/userSchema");       
const { Chat } = require("../models/chatSchema");

router.post("/invite", requireAuth("token"), async (req, res) => {
  try {
    const { projectId, email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only the creator can invite
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to invite members." });
    }
    const userToInvite = await User.findOne({ email: email });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    // Avoid duplicate invites or existing members
    if (
      project.teamMembers.includes(userToInvite._id)
    ) {
      return res.status(400).json({ message: "User already invited or part of the project." });
    }

    if(await Invite.findOne({ project: project._id, invitedUser: userToInvite._id, status: "Pending" })){
      return res.status(400).json({ message: "An invite is already pending for this user." });
    }

    // Create invite document
    const invite = await Invite.create({
      project: project._id,
      invitedBy: req.user._id,
      invitedUser: userToInvite._id,
      status: "Pending"
    });
    await invite.save();


    res.json({ success: true, message: "Invitation sent successfully!" });
  } catch (err) {
    console.error("Error sending invite:", err);
    res.status(500).json({ message: "Error sending invite." });
  }
});



// POST /invites/:id/accept
router.post("/:id/accept", requireAuth("token"), async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id).populate("project");
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    // Only invited user can accept
    if (invite.invitedUser.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });

    // Update invite
    invite.status = "Accepted";
    await invite.save();

    // Add user to project team
    const project = await Project.findById(invite.project._id);
    if (!project.teamMembers.includes(req.user._id)) {
      project.teamMembers.push(req.user._id);
      await project.save();
    }
    const chat = await Chat.findById(project.chat);
    if(chat && !chat.participants.includes(req.user._id)){
      chat.participants.push(req.user._id);
      await chat.save();
    }

    // TODO: Emit socket.io event to notify project members

    res.json({ success: true, message: "Invite accepted", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
});



// GET /invites/me
router.get("/me", requireAuth("token"), async (req, res) => {
  try {
    const invites = await Invite.find({ invitedUser: req.user._id, status: "Pending" })
      .populate("project", "name description")
      .populate("invitedBy", "fullname username");

    // Filter out any invites whose project was deleted
    const validInvites = invites.filter(invite => invite.project !== null);

    res.json({ success: true, invites: validInvites });
  } catch (err) {
    console.error("Error fetching invites:", err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
});

router.delete("/:id", requireAuth("token"), async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    if (invite.invitedUser.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });

    await invite.remove();

    res.json({ success: true, message: "Invite deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete invite" });
  }
});
module.exports = { router };