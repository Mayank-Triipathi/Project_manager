// src/components/InviteModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import axios from "axios";

const InviteModal = ({ isOpen, onClose, projectId }) => {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const handleInvite = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: false });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/invites/invite",
        { projectId, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ loading: false, message: response.data.message, error: false });
      setEmail("");
      setTimeout(onClose, 1200); // Close after success
    } catch (err) {
      const msg = err.response?.data?.message || "Error sending invite";
      setStatus({ loading: false, message: msg, error: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Invite a Team Member
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Enter the email of the user you want to invite.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status.loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition"
              >
                {status.loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invite
                  </>
                )}
              </motion.button>
            </form>

            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-center font-medium ${
                  status.error ? "text-red-600" : "text-green-600"
                }`}
              >
                {status.message}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;