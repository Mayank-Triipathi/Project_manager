const { Router } = require("express");
const { Project } = require("../models/projectSchema");
const { Task } = require("../models/taskSchema");
const { requireAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chatSchema");
const { Invite } = require("../models/inviteSchema");
const { User } = require("../models/userSchema");

const router = Router();

router.post("/create", requireAuth("token"), async (req, res) => {
  try {
    const { name, description, startDate, endDate, priority } = req.body;
    const createdBy = req.user._id;

    if (!name || !startDate) {
      return res.status(400).json({ message: "Name and start date are required" });
    }

    // Create chat for the project
    const chat = await Chat.create({ participants: [createdBy], isGroupChat: true }); 

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

// GET /users/:userId/projects
router.get("/:userId/getAll", requireAuth("token"), async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Find projects where user is leader
    const leaderProjects = await Project.find({ createdBy: userId })
      .populate("tasks", "status"); // only populate task status

    // 2️⃣ Find projects where user is a member but not leader
    const leaderProjectIds = leaderProjects.map(p => p._id.toString());
    const memberProjects = await Project.find({
      teamMembers: userId,
      _id: { $nin: leaderProjectIds },
    }).populate("tasks", "status");

    // 3️⃣ Compute completion status
    const computeProjectCompletion = (projects) => {
      return projects.map(project => {
        const totalTasks = project.tasks?.length || 0;
        const completedTasks = project.tasks?.filter(t => t.status === "Done").length || 0;

        // Project done if all tasks are completed
        const isDone = totalTasks > 0 && completedTasks === totalTasks;

        // Progress percentage
        const progress =
          totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
          isDone,
        };
      });
    };

    const leaderWithProgress = computeProjectCompletion(leaderProjects);
    const memberWithProgress = computeProjectCompletion(memberProjects);

    res.json({
      success: true,
      leaderProjects: leaderWithProgress,
      memberProjects: memberWithProgress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});


router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "fullname email")
      .populate("teamMembers", "fullname email")
      .populate({
        path: "tasks",
        populate: { path: "assignedTo", select: "fullname email" },
      });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const totalTasks = project.tasks.length;
    // tolerate different status formats (case-insensitive) and common synonyms
    const completedTasks = project.tasks.filter(t => 
      t.status==="Done").length;
    const progressRaw = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const progress = Math.round(progressRaw * 10) / 10; // keep one decimal, numeric

    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        leader: project.createdBy,
        members: project.teamMembers,
        tasks: project.tasks,
        chat: project.chat,
        progress, // numeric
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/teamMembers/:projectId", requireAuth("token"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("teamMembers", "fullname email");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true, teamMembers: project.teamMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

router.get("/:projectId/:memberId/stats",requireAuth("token"),async(req,res)=>{
  const project = await Project.findById(req.params.projectId);
  if(!project){
    return res.status(404).json({error:"Project not found"});
  }
  // Only project creator or the member themselves can view stats
  if(!project.createdBy.equals(req.user._id) && req.params.memberId!==req.params.userId){
    return res.status(403).json({error:"Not authorized to view member stats"});
  }
  try{
    const {memberId}=req.params;
    const totalTasks = await Task.countDocuments({project:req.params.projectId, assignedTo:memberId });
    const completedTasks = await Task.countDocuments({
      project:req.params.projectId,
      assignedTo:memberId,
      status:"Done"
    });
    const user = await User.findById(memberId).select("fullname email");
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    res.json({success:true, totalTasks, completedTasks, user});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Failed to fetch member stats"});
  }
});


module.exports = { router };