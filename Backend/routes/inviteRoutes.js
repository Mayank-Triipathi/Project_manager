const { Router } = require("express");
const { Project } = require("../models/projectSchema");
const { requireAuth } = require("../middlewares/auth");
const router = Router();
const { Invite } = require("../models/inviteSchema");

router.post("/invite", requireAuth("token"), async (req, res) => {
  try {
    const { projectId, userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only creator (or admin) can invite
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to invite" });
    }

    // Avoid duplicate invites or members
    if (project.teamMembers.includes(userId) || project.pendingInvites.includes(userId)) {
      return res.status(400).json({ message: "User already invited or in project" });
    }

    project.pendingInvites.push(userId);
    await project.save();

    // (Optional) You could emit a socket event to notify the invited user
    // io.to(userId).emit("projectInvite", { projectId, projectName: project.name });

    res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending invite" });
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

    // TODO: Emit socket.io event to notify project members

    res.json({ success: true, message: "Invite accepted", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
});

// POST /invites/:id/reject
router.post("/:id/reject", requireAuth("token"), async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    if (invite.invitedUser.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });

    invite.status = "Rejected";
    await invite.save();

    res.json({ success: true, message: "Invite rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject invite" });
  }
});


// GET /invites/me
router.get("/me", requireAuth("token"), async (req, res) => {
  try {
    const invites = await Invite.find({ invitedUser: req.user._id, status: "Pending" })
      .populate("project", "name description")
      .populate("invitedBy", "fullname username");

    res.json({ success: true, invites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
});

module.exports = { router };