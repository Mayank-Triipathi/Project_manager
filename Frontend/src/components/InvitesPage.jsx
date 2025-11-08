import { useState, useEffect } from 'react';
import { Check, X, Mail, Inbox, Sparkles, UserPlus, Loader } from 'lucide-react';

// API Helper Functions
const api = {
    
  fetchInvites: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:8000/api/invites/me', { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
    return { data: await response.json() };
  },
  
  acceptInvite: async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/api/invites/${id}/accept`, { method: 'POST', credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
    return { success: true };
  },
  
  declineInvite: async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/api/invites/${id}`, { method: 'DELETE', credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
    return { success: true };
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// Individual Invite Card Component
const InviteCard = ({ invite, onAccept, onDecline }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(invite._id);
      setIsRemoving(true);
    } catch (error) {
      console.error('Failed to accept invite:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline(invite._id);
      setIsRemoving(true);
    } catch (error) {
      console.error('Failed to decline invite:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
        isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        transition: 'all 0.5s ease-out',
        animation: 'slideInUp 0.5s ease-out'
      }}
    >
      {/* Card Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold text-lg">{invite.project.name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 leading-relaxed">
          {invite.project.description}
        </p>

        {/* Invited By Section */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
            {invite.invitedBy.fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-500">Invited by</p>
            <p className="font-semibold text-gray-800">{invite.invitedBy.fullname}</p>
            <p className="text-xs text-gray-500">@{invite.invitedBy.username}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
              transition-all duration-200
              ${isAccepting || isDeclining
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isAccepting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Accept
              </>
            )}
          </button>

          <button
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
              transition-all duration-200
              ${isAccepting || isDeclining
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isDeclining ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Declining...
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                Decline
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div 
      className="text-center py-16"
      style={{ animation: 'fadeIn 0.6s ease-out' }}
    >
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <Inbox className="w-32 h-32 text-gray-300" />
          <Sparkles className="w-12 h-12 text-indigo-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        All Caught Up!
      </h2>
      <p className="text-gray-500 text-lg mb-2">
        You don't have any pending invitations
      </p>
      <p className="text-gray-400">
        When someone invites you to a project, it will appear here
      </p>
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="bg-gray-200 h-20"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Invites Page Component
const InvitesPage = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await api.fetchInvites();
      setInvites(response.data.invites);
    } catch (error) {
      console.error('Error fetching invites:', error);
      showToast('Failed to load invites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAccept = async (id) => {
    try {
      await api.acceptInvite(id);
      
      // Wait for animation before removing
      setTimeout(() => {
        setInvites(prev => prev.filter(inv => inv._id !== id));
      }, 500);
      
      showToast('Invitation accepted successfully!', 'success');
    } catch (error) {
      showToast('Failed to accept invitation', 'error');
      throw error;
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.declineInvite(id);
      
      // Wait for animation before removing
      setTimeout(() => {
        setInvites(prev => prev.filter(inv => inv._id !== id));
      }, 500);
      
      showToast('Invitation declined', 'success');
    } catch (error) {
      showToast('Failed to decline invitation', 'error');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Page Header */}
        <div 
          className="mb-8"
          style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Project Invitations
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your pending project invites
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        {!loading && invites.length > 0 && (
          <div 
            className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-indigo-500"
            style={{ animation: 'slideInUp 0.5s ease-out 0.1s backwards' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Invitations</p>
                <p className="text-3xl font-bold text-indigo-600">{invites.length}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-full">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <LoadingSkeleton />
        ) : invites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {invites.map((invite, index) => (
              <div
                key={invite._id}
                style={{
                  animation: `slideInUp 0.5s ease-out ${0.1 * (index + 1)}s backwards`
                }}
              >
                <InviteCard
                  invite={invite}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InvitesPage;