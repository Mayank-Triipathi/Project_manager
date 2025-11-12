import './App.css'
import Navbar from './components/navbar.jsx'
import Home from './app/Home'
import SignupPage from "./components/signup.jsx"; 
import LoginPage from "./components/login.jsx";
import Forgot from "./components/forgot-pass.jsx";
import { Routes, Route } from "react-router-dom";
import Dashboard from './components/project-dashboard.jsx';
import CreateProject from './components/create-project.jsx';
import Project from './components/project.jsx';
import InvitesPage from './components/InvitesPage.jsx';
import AddTask from './components/tasks.jsx';
import Chat from './components/chat.jsx';
import MemberStats from './components/memberStats';
import FeaturesPage from './components/project-features';
// 🧩 Import the shared socket instance
import socket from './socket';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      socket.connect();

      socket.emit("join", userId);
    }


    // Cleanup when the app unmounts (usually not needed in SPAs)
    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* <Navbar /> stays visible on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/project/:id" element={<Project />} />
        <Route path="/invites" element={<InvitesPage />} />
        <Route path="/AddTask/:projectId" element={<AddTask />} />
        <Route path="/chat/:chatId" element={<Chat socket={socket} />} />
        <Route path="/member-stats/:projectId/:memberId" element={<MemberStats />} />
        <Route path="/feature-page" element={<FeaturesPage/>}/>
      </Routes>
    </>
  );
}

export default App;
