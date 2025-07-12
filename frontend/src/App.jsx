
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* ——— Core / auth / landing ——— */
import Landing from "./component/Landing";
import Login from "./component/login";
import Signup from "./component/signup";
import Header from "./basic/Header";
import Footer from "./basic/Footer";
/* ——— Main application pages ——— */
import Home from "./component/Home"; // Browse users
import UserDashboard from "./component/User"; // Your own profile/dashboard
import OtherUserProfile from "./component/Pages/OtherUserProfile";

/* ——— Swap workflow pages ——— */
import SwapRequests from "./component/Pages/SwapRequest"; // Manage incoming/outgoing requests
import ScheduleSwap from "./component/Pages/ScheduleSwap"; // Pick date/time
import VideoRoom from "./component/Pages/VideoRoom"; // Live video teaching room
import SwapRequestSent from "./component/Pages/SwapRequest"; // Optional "sent" confirmation
import Navbar from "./basic/Navbar";

/* ——— Chat components ——— */
import Chat from "./component/Chat";
import ChatList from "./component/ChatList";
import Requests from "./component/Requests";

/* ——— Shared layout (optional) ——— */
// import Header from "./component/basic/Header";
// import Footer from "./component/basic/Footer";

function App() {
  return (
    <Router>
      {/* If you want a global header / footer, uncomment the two lines below */}
      {/* <Header /> */}
      <Routes>
        {/* Public / auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main browsing */}
        <Route path="/home" element={<Home />} />
        
        <Route path="/dashboard" element={<div><Navbar /><UserDashboard /><Footer /></div>} />
        
        {/* Single‑user profile (when you click a card) */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/profile/:userId" element={<OtherUserProfile />} />

        {/* Chat routes */}
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<Chat />} />

        {/* Swap requests page */}
        <Route path="/requests" element={<Requests />} />

        {/* Scheduling & live room */}
        <Route path="/schedule/:swapId" element={<ScheduleSwap />} />
        <Route path="/room/:roomId" element={<VideoRoom />} />

        {/* Optional confirmation */}
        <Route path="/swap-request-sent" element={<SwapRequestSent />} />
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
