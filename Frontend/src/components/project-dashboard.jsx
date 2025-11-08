"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, LogOut, Moon, Sun, Users, Calendar, Zap, AlertCircle } from "lucide-react"
import { Link,useNavigate } from "react-router-dom";

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDark, setIsDark] = useState(false)
  const [userName, setUserName] = useState("User")
  const [invites, setInvites] = useState([]); // list of invite objects
  const [hasNewInvite, setHasNewInvite] = useState(false);


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")

        if (!token || !userId) {
          setError("Authentication required. Please log in.")
          return
        }

        const response = await fetch(`http://localhost:8000/api/projects/${userId}/getAll`, {
            headers: {
                Authorization: `Bearer ${token}`, // <- this is standard
            },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const result = await response.json()
        setData(result)

        const storedName = localStorage.getItem("userName")
        if (storedName) setUserName(storedName)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])
  const fetchInvites = async () => {
  try {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    const response = await fetch(`http://localhost:8000/api/invites/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const result = await response.json();
      setInvites(result);
      if (Array.isArray(result.invites) && result.invites.some(invite => !invite.seen)) {
        setHasNewInvite(true);
      }
    }
  } catch (err) {
    console.error("Error fetching invites:", err);
  }
};

fetchInvites();

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    window.location.href = "/"
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const filterProjects = (projects) => {
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.02,
      y: -4,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-slate-950" : "bg-slate-50"}`}>
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${
          isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                  isDark
                    ? "bg-gradient-to-br from-blue-500 to-purple-600"
                    : "bg-gradient-to-br from-blue-600 to-purple-700"
                }`}
              >
                PH
              </div>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>ProjectHub</span>
            </motion.div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className={`relative w-full ${isDark ? "bg-slate-900" : "bg-slate-100"} rounded-lg`}>
                <Search className={`absolute left-3 top-3 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 outline-none transition-all ${
                    isDark
                      ? "bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                      : "bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>

            {/* Right - User & Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <div
                className={`flex items-center gap-3 pl-4 border-l ${isDark ? "border-slate-800" : "border-slate-200"}`}
              >
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{userName}</p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Project Manager</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    isDark
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-gradient-to-br from-emerald-600 to-teal-700"
                  }`}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-red-400"
                      : "text-slate-600 hover:bg-slate-200 hover:text-red-600"
                  }`}
                >
                  <LogOut size={20} />
                </motion.button>
                {/* Invites Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/invites")}
                  className={`relative px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                    isDark
                      ? "bg-purple-600 text-white hover:bg-purple-500"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  <Users size={18} />
                  Invites
                  {hasNewInvite && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </motion.button>
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-project")}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                    isDark
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                >
                <Zap size={18} />
                Create Project
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className={`relative w-full ${isDark ? "bg-slate-900" : "bg-slate-100"} rounded-lg`}>
              <Search className={`absolute left-3 top-3 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-96"
          >
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className={`w-16 h-16 rounded-full border-4 ${
                  isDark ? "border-slate-700 border-t-blue-500" : "border-slate-200 border-t-blue-600"
                }`}
              />
            </div>
            <p className={`mt-4 text-lg font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Loading your projects...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 flex items-start gap-4 ${
              isDark ? "bg-red-950/30 border border-red-900/50" : "bg-red-50 border border-red-200"
            }`}
          >
            <AlertCircle className={`w-6 h-6 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
            <div>
              <h3 className={`font-semibold ${isDark ? "text-red-300" : "text-red-900"}`}>Error Loading Projects</h3>
              <p className={`text-sm mt-1 ${isDark ? "text-red-200" : "text-red-700"}`}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Projects Sections */}
        {data && !loading && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
            {/* Projects I Lead */}
            {data.leaderProjects.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                  <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Projects I Lead</h2>
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                      isDark ? "bg-blue-950 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {filterProjects(data.leaderProjects).length}
                  </span>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filterProjects(data.leaderProjects).map((project) => (
                      <Link key={project._id} to={`/project/${project._id}`}>
                        <ProjectCard
                          project={project}
                          isLeader={true}
                          isDark={isDark}
                          cardVariants={cardVariants}
                        />
                      </Link>
                    ))}
                </motion.div>



                {filterProjects(data.leaderProjects).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
                  >
                    <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      No projects match your search
                    </p>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* Projects I'm Part Of */}
            {data.memberProjects.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                  <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Projects I'm Part Of
                  </h2>
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                      isDark ? "bg-purple-950 text-purple-300" : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {filterProjects(data.memberProjects).length}
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filterProjects(data.memberProjects).map((project) => (
                    <Link key={project._id} to={`/project/${project._id}`}>
                      <ProjectCard
                        project={project}
                        isLeader={false}
                        isDark={isDark}
                        cardVariants={cardVariants}
                      />
                    </Link>
                  ))}
                </motion.div>



                {filterProjects(data.memberProjects).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
                  >
                    <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      No projects match your search
                    </p>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* Empty State */}
            {data.leaderProjects.length === 0 && data.memberProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center py-20 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
              >
                <Zap className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  No Projects Yet
                </h3>
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Create or join a project to get started
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}


function ProjectCard({ project, isLeader, isDark, cardVariants }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`rounded-xl p-6 cursor-pointer transition-all border ${
        isDark
          ? "bg-slate-900 border-slate-800 hover:border-slate-700"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{project.name}</h3>
            {isLeader && (
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  isDark ? "bg-blue-950 text-blue-300" : "bg-blue-100 text-blue-700"
                }`}
              >
                Leader
              </span>
            )}
          </div>
          <p className={`text-sm line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {project.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Progress</span>
            <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {project.progress}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isLeader
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gradient-to-r from-purple-500 to-purple-600"
              }`}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
        {project.members !== undefined && (
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{project.members} members</span>
          </div>
        )}
        {project.dueDate && (
          <div className="flex items-center gap-2 ml-auto">
            <Calendar className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{project.dueDate}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
