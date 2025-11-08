import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Flag, Users, Edit2, Trash2, Check, AlertCircle, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
const API_URL = 'http://localhost:8000/api';

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm z-50 flex items-center gap-3 bg-white border-2 border-gray-200"
  >
    {type === 'success' ? (
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="w-5 h-5 text-green-600" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-600" />
      </div>
    )}
    <span className="font-medium text-gray-900">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70 text-gray-500">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Priority Badge
const PriorityBadge = ({ priority }) => {
  const colors = {
    Low: 'bg-blue-100 text-blue-700 border-blue-300',
    Medium: 'bg-amber-100 text-amber-700 border-amber-300',
    High: 'bg-red-100 text-red-700 border-red-300'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${colors[priority]}`}>
      <Flag className="w-3 h-3 inline mr-1" />
      {priority}
    </span>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'in-progress': 'bg-purple-100 text-purple-700 border-purple-300',
    done: 'bg-green-100 text-green-700 border-green-300'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${colors[status]}`}>
      {status === 'done' ? <Check className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
      {status.replace('-', ' ')}
    </span>
  );
};

// Task Form Modal
const TaskFormModal = ({ isOpen, onClose, projectId, task, onSuccess, teamMembers }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'pending',
    assignedTo: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || 'Medium',
        status: task.status || 'pending',
        assignedTo: task.assignedTo?.map(u => u._id) || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'pending',
        assignedTo: []
      });
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.dueDate) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      if(task) {
        response = await fetch(`${API_URL}/tasks/${task._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${API_URL}/tasks/${projectId}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.task, task ? 'updated' : 'created');
        onClose();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssignee = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
        : [...prev.assignedTo, memberId]
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-indigo-100"
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {task ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none bg-white"
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-indigo-600" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {task && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Assign Team Members
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 max-h-60 overflow-y-auto border-2 border-gray-200">
                  {teamMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No team members available</p>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <motion.div
                          key={member._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleAssignee(member._id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            formData.assignedTo.includes(member._id)
                              ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-500 shadow-md'
                              : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {member.fullname?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{member.fullname}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                          {formData.assignedTo.includes(member._id) && (
                            <Check className="w-5 h-5 text-indigo-600" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  {formData.assignedTo.length} member(s) selected
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {task ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {task ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, task, onConfirm, isLoading }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-8"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-2">Are you sure you want to delete</p>
            <p className="text-xl font-bold text-gray-900 mb-2">"{task?.title}"?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Task'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-indigo-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{task.title}</h3>
        <div className="flex gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-indigo-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(task)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </motion.button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
          <Calendar className="w-4 h-4" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          {isOverdue && <span className="text-xs">(Overdue)</span>}
        </div>
        
        {task.assignedTo?.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md"
                title={user.fullname}
              >
                {user.fullname?.substring(0, 2).toUpperCase()}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Component
export default function TaskManagementModal({ projectId, initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { projectId: paramProjectId } = useParams();

  // Use projectId from params if not provided as prop
  projectId = projectId || paramProjectId;
  useEffect(() => {
    if (projectId) {
      loadTeamMembers();
      loadTasks();
    }
  }, [projectId]);

  const loadTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/teamMembers/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tasks/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTaskSuccess = (task, action) => {
    if (action === 'created') {
      setTasks([...tasks, task]);
      showToast('Task created successfully!', 'success');
    } else if (action === 'updated') {
      setTasks(tasks.map(t => t._id === task._id ? task : t));
      showToast('Task updated successfully!', 'success');
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tasks/${selectedTask._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setTasks(tasks.filter(t => t._id !== selectedTask._id));
        showToast('Task deleted successfully!', 'success');
        setShowDeleteModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      showToast('Failed to delete task', 'error');
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </motion.button>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200"
        >
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No tasks found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first task to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(task) => { setSelectedTask(task); setShowEditModal(true); }}
                onDelete={(task) => { setSelectedTask(task); setShowDeleteModal(true); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
        onSuccess={handleTaskSuccess}
        teamMembers={teamMembers}
      />

      <TaskFormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedTask(null); }}
        projectId={projectId}
        task={selectedTask}
        onSuccess={handleTaskSuccess}
        teamMembers={teamMembers}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedTask(null); }}
        task={selectedTask}
        onConfirm={handleDeleteTask}
        isLoading={isDeleting}
      />
    </div>
  );
}