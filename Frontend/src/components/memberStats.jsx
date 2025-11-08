import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award,
  MessageCircle,
  User
} from 'lucide-react';

const MemberStats = () => {
  const { projectId, memberId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (projectId && memberId) {
      fetchMemberStats();
    } else {
      setError('Invalid project or member ID');
      setLoading(false);
    }
  }, [projectId, memberId]);

  useEffect(() => {
    if (stats) {
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [stats]);

  const fetchMemberStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/${memberId}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch member statistics');
      }

      const data = await response.json();
      setStats(data);
      setMemberInfo(data.user);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!stats || stats.totalTasks === 0) return 0;
    return (stats.completedTasks / stats.totalTasks) * 100;
  };

  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-indigo-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getPerformanceRating = () => {
    const progress = calculateProgress();
    if (progress >= 90) return { text: 'Excellent', emoji: '🌟', color: 'text-green-600' };
    if (progress >= 70) return { text: 'Great', emoji: '🎯', color: 'text-blue-600' };
    if (progress >= 50) return { text: 'Good', emoji: '👍', color: 'text-yellow-600' };
    if (progress >= 25) return { text: 'Fair', emoji: '📈', color: 'text-orange-600' };
    return { text: 'Needs Improvement', emoji: '💪', color: 'text-red-600' };
  };

  const handleMessagePersonally = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/chats/message-personal/${projectId}/${memberId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to create chat');
      }
      
      const chat = await res.json();
      navigate(`/chat/${chat._id}`);
    } catch (err) {
      console.error('Error creating chat:', err);
      alert('Failed to open chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Stats</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const rating = getPerformanceRating();
  const pendingTasks = stats.totalTasks - stats.completedTasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Back</span>
          </button>
          
          <button
            onClick={handleMessagePersonally}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Message Personally</span>
          </button>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 transform transition-all duration-500 hover:shadow-2xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {memberInfo ? `${memberInfo.fullname}'s Performance` : 'Member Performance Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {memberInfo ? memberInfo.email : 'Detailed analytics and insights'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Tasks */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-500 ${
            animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          } hover:shadow-xl hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Tasks</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.totalTasks}</p>
          </div>

          {/* Completed Tasks */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-500 ${
            animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          } hover:shadow-xl hover:-translate-y-1`}
          style={{ transitionDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.completedTasks}</p>
          </div>

          {/* Pending Tasks */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-500 ${
            animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          } hover:shadow-xl hover:-translate-y-1`}
          style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl">⏳</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending</h3>
            <p className="text-4xl font-bold text-gray-800">{pendingTasks}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Circular Progress */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-700 ${
            animateStats ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          style={{ transitionDelay: '300ms' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Completion Rate
            </h2>
            
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Background Circle */}
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="112"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="112"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 112}`}
                    strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="text-indigo-500" style={{ stopColor: 'currentColor' }} />
                      <stop offset="100%" className="text-purple-500" style={{ stopColor: 'currentColor' }} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {progress.toFixed(0)}%
                  </span>
                  <span className="text-gray-600 text-sm mt-2">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Rating */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-700 ${
            animateStats ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Performance Rating
            </h2>
            
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-8xl mb-4 animate-bounce">{rating.emoji}</div>
              <h3 className={`text-4xl font-bold ${rating.color} mb-2`}>
                {rating.text}
              </h3>
              <p className="text-gray-600 text-center max-w-xs">
                {progress >= 80 
                  ? 'Outstanding performance! Keep up the excellent work.' 
                  : progress >= 50 
                  ? 'Good progress! You\'re on the right track.' 
                  : 'There\'s room for improvement.'}
              </p>
              
              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{stats.completedTasks}</p>
                  <p className="text-xs text-gray-600 mt-1">Tasks Done</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
                  <p className="text-xs text-gray-600 mt-1">Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-700 ${
          animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        style={{ transitionDelay: '500ms' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Task Distribution</h2>
          
          <div className="space-y-6">
            {/* Completed Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Completed Tasks
                </span>
                <span className="text-sm font-bold text-gray-800">{stats.completedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
                  style={{ 
                    width: stats.totalTasks > 0 ? `${(stats.completedTasks / stats.totalTasks) * 100}%` : '0%'
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {stats.totalTasks > 0 ? `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Pending Tasks
                </span>
                <span className="text-sm font-bold text-gray-800">{pendingTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
                  style={{ 
                    width: stats.totalTasks > 0 ? `${(pendingTasks / stats.totalTasks) * 100}%` : '0%',
                    transitionDelay: '200ms'
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {stats.totalTasks > 0 ? `${((pendingTasks / stats.totalTasks) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStats;