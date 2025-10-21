import './App.css'
import Navbar from './components/navbar.jsx'
import Home from './app/Home'
import SigninPage from "./components/signin.jsx"; 
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar /> {/* stays visible on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SigninPage />} />
      </Routes>
    </>
  );
}

export default App
