import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBell, FaCog, FaSignOutAlt, FaComments } from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div
          className="text-2xl font-bold text-blue-700 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Skill<span className="text-blue-900">Swap</span>
        </div>

        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <li className="hover:text-blue-700 cursor-pointer" onClick={() => navigate('/')}>Home</li>
          <li className="hover:text-blue-700 cursor-pointer" onClick={() => navigate('/home')}>Browse Skills</li>
          {isAuthenticated && (
            <li className="hover:text-blue-700 cursor-pointer" onClick={() => navigate('/user')}>My Profile</li>
          )}
        </ul>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Chat Icon */}
              <button
                onClick={() => navigate('/chat')}
                className="relative p-2 text-gray-600 hover:text-blue-700 transition"
                title="Messages"
              >
                <FaComments className="text-xl" />
              </button>

              {/* Requests Icon */}
              <button
                onClick={() => navigate('/requests')}
                className="relative p-2 text-gray-600 hover:text-blue-700 transition"
                title="Skill Requests"
              >
                <FaBell className="text-xl" />
                {/* You can add a notification badge here */}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <img
                    src={user?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user?.name || user?.email || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/user');
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaUser className="text-sm" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/chat');
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaComments className="text-sm" />
                      <span>Messages</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/requests');
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaBell className="text-sm" />
                      <span>Requests</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FaSignOutAlt className="text-sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 border border-blue-700 text-blue-700 rounded hover:bg-blue-50 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
              >
                Join Now
              </button>
            </>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
