import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-700 cursor-pointer"
          onClick={() => navigate('/')}
        >
          Skill<span className="text-blue-900">Swap</span>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <li className="hover:text-blue-700 cursor-pointer" onClick={() => navigate('/')}>Home</li>
          <li className="hover:text-blue-700 cursor-pointer">Browse Skills</li>
          <li className="hover:text-blue-700 cursor-pointer">How It Works</li>
          <li className="hover:text-blue-700 cursor-pointer">Community</li>
        </ul>

        {/* Auth Buttons */}
        <div className="space-x-3">
          <button
            onClick={() => navigate('/login')} // Changed from '/signin' to '/login'
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
        </div>
      </nav>
    </header>
  );
};

export default Header;