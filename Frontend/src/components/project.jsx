import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Users, CheckCircle, Clock, Plus, UserPlus, Briefcase, ChevronDown, MessageCircle, BarChart3 } from 'lucide-react';
import InviteModal from './InviteModel.jsx';
const API = import.meta.env.VITE_API_BASE_URL;

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [loadingUserTasks, setLoadingUserTasks] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch project');

        const data = await response.json();
        if (data.success) {
          setProject(data.project);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!project) return;
      
      try {
        setLoadingUserTasks(true);
        const response = await fetch(`${API}/api/tasks/user/tasks/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user tasks');

        const data = await response.json();
        if (data.success) {
          setUserTasks(data.tasks);
        }
      } catch (err) {
        console.error('Error fetching user tasks:', err);
      } finally {
        setLoadingUserTasks(false);
      }
    };

    fetchUserTasks();
  }, [id, project, token]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const data = await response.json();
      if (data.success) {
        setUserTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  const handleChatWithLeader = async (leaderId) => {
    try {
      const response = await fetch(
        `${API}/api/chats/message-personal/${project._id}/${leaderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      
      const chat = await response.json();
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Done': 'bg-green-100 text-green-700 border-green-200',
      'To Do': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
      done: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    return status === 'Done' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-12 bg-white/50 rounded-lg w-3/4 mb-4"></div>
            <div className="h-6 bg-white/50 rounded-lg w-1/2 mb-8"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/50 rounded-2xl h-48 animate-pulse"></div>
              <div className="bg-white/50 rounded-2xl h-96 animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/50 rounded-2xl h-64 animate-pulse"></div>
              <div className="bg-white/50 rounded-2xl h-48 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
        >
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Project</h2>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!project) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {project.name}
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/chat/${project.chat}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Project Chat
            </motion.button>
          </div>
          <p className="text-gray-600 text-lg">{project.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Project Progress</h2>
                <span className="text-2xl font-bold text-indigo-600">{project.progress}%</span>
              </div>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Number(project.progress) || 0}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                  Tasks
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/AddTask/${project._id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Customize Tasks
                </motion.button>
              </div>
              <div className="space-y-3">
                {project.tasks.map((task, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Assigned to {task.assignedTo.fullname}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                {project.leader._id === userId ? 'All Project Tasks' : 'My Assigned Tasks'}
              </h2>
              
              {loadingUserTasks ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-xl h-20"></div>
                  ))}
                </div>
              ) : userTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTasks.map((task, idx) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800">
                              {task.title}
                            </h3>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/chat/${task.chat}`)}
                              className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                              title="Task Chat"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {task.priority && (
                              <span className={`px-2 py-1 rounded ${
                                task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                            {task.dueDate && (
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className={`appearance-none cursor-pointer px-3 py-2 pr-8 rounded-lg text-xs font-medium border ${getStatusColor(task.status)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" />
                Project Leader 
              </h2>
              <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {getInitials(project.leader.fullname)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{project.leader.fullname}</p>
                    <p className="text-sm text-gray-600">{project.leader.email}</p>
                  </div>
                </div>
                {project.leader._id !== userId && (
                  <button
                    onClick={() => handleChatWithLeader(project.leader._id)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                    title="Chat with leader"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Team Members
                </h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {project.members.length}
                </span>
              </div>
              <div className="space-y-3 mb-4">
                {project.members.map((member, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group cursor-pointer"
                    onClick={() => navigate(`/member-stats/${project._id}/${member._id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold shadow-sm">
                      {getInitials(member.fullname)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {member.fullname}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </motion.button>
            </motion.div>
          </div> 
        </div>
      </div>
      
      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={project._id}
      />
    </div>
  );
};

export default ProjectDetails;