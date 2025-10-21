const { Router } = require("express");
const { Task } = require("../models/taskSchema");
const { Project } = require("../models/projectSchema");
const { requireAuth } = require("../middlewares/auth");
const router = Router();

router.post("/projects/:projectId/tasks", requireAuth("token"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, priority, assignedTo } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Only project creator or team members can create tasks
    if (!project.teamMembers.includes(req.user._id) && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorized to create tasks in this project" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project: projectId,
      assignedTo: assignedTo || []
    });

    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task creation failed" });
  }
});

router.get("/projects/:projectId/tasks", requireAuth("token"), async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId, assignedTo: req.user._id })
      .populate("assignedTo", "fullname email")
      .populate("project", "name");

    res.json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});


router.put("/tasks/:taskId", requireAuth("token"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, dueDate, priority, assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Check if user is allowed
    const project = await Project.findById(task.project);
    if (!task.assignedTo.includes(req.user._id) && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: "Not authorized to update this task" });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task update failed" });
  }
});


router.delete("/tasks/:taskId", requireAuth("token"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: "Only project creator can delete task" });
    }

    await task.remove();
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task deletion failed" });
  }
});

router.get("/tasks/:taskId", requireAuth("token"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
      .populate("assignedTo", "fullname email")
      .populate("project", "name");
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (!task.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ error: "Not authorized to view this task" });
    }

    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

module.exports = { router };