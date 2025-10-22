import './App.css'
import Navbar from './components/navbar.jsx'
import Home from './app/Home'
import SigninPage from "./components/signin.jsx"; 
import LoginPage from "./components/login.jsx";
import Forgot from "./components/forgot-pass.jsx";
import { Routes, Route } from "react-router-dom";
import Dashboard from './components/project-dashboard.jsx';

function App() {
  return (
    <>
      <Navbar /> {/* stays visible on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App
