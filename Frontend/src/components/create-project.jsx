"use client"

import React, { useState } from "react"



import { motion } from "framer-motion"
import { Loader2, CheckCircle, AlertCircle, Sun, Moon } from "lucide-react"


export default function CreateProject() {
  // Form state
  const [formData, setFormData] = useState({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  priority: "Medium",
})


  // UI state
const [errors, setErrors] = useState({})
const [loading, setLoading] = useState(false)
const [success, setSuccess] = useState(false)
const [errorMessage, setErrorMessage] = useState("")
const [darkMode, setDarkMode] = useState(false)


  // Validation function
  const validateForm = () => {
  const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setErrorMessage("Authentication token not found. Please log in.")
        setLoading(false)
        return
      }

      const response = await fetch("http://localhost:8000/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create project")
      }

      const data = await response.json()

      // Success state
      setSuccess(true)
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setErrorMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  }

  const successVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
    >
      {/* Theme Toggle */}
      <motion.button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </motion.button>

      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div className="w-full max-w-2xl" variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">Create New Project</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Start building something amazing today</p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 sm:p-10">
            {/* Success Message */}
            {success && (
              <motion.div
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-800 dark:text-emerald-300 font-medium">Project created successfully!</p>
              </motion.div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-300 font-medium">{errorMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project Name *
                </label>
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    errors.name
                      ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  whileFocus={{ scale: 1.01 }}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-sm mt-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <motion.textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 resize-none"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Start Date */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Start Date *
                  </label>
                  <motion.input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      errors.startDate
                        ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.startDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 dark:text-red-400 text-sm mt-1"
                    >
                      {errors.startDate}
                    </motion.p>
                  )}
                </motion.div>

                {/* End Date */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    End Date
                  </label>
                  <motion.input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
              </div>

              {/* Priority */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <motion.select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  whileFocus={{ scale: 1.01 }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </motion.select>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                variants={itemVariants}
                whileHover={!loading ? "hover" : {}}
                whileTap={!loading ? "tap" : {}}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Footer Text */}
          <motion.p variants={itemVariants} className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
            All fields marked with * are required
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
