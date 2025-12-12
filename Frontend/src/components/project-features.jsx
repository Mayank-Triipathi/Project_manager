import { useState, useEffect } from 'react';
import { CheckCircle, Users, BarChart3, Layout, Database, Zap, MessageCircle } from 'lucide-react';

export default function FeaturesPage() {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      features.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 150);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Layout,
      title: "Project Management",
      description: "Create and organize multiple projects with ease. Track progress, set deadlines, and manage everything from one central hub.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: CheckCircle,
      title: "Task Management",
      description: "Add, edit, and track tasks efficiently. Set priorities, due dates, and monitor status from pending to completion.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Assign tasks to team members, manage roles, and collaborate seamlessly with your entire team in real-time.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Communicate instantly with your team through built-in real-time messaging. Stay connected and resolve issues faster.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: BarChart3,
      title: "Dashboard & Analytics",
      description: "Visualize your progress with intuitive charts and graphs. Get insights into project timelines and task completion rates.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "User-Friendly Interface",
      description: "Experience a modern, intuitive design that works flawlessly across all devices. Navigate with ease and boost productivity.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Database,
      title: "Data Persistence",
      description: "Your data is automatically saved and securely stored. Never worry about losing your important project information.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Powerful Features
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
            Everything you need to manage projects efficiently and collaborate seamlessly with your team
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.includes(index);
            
            return (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already managing their projects more efficiently
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl">
            Start Free Trial
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}