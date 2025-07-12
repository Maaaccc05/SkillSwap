import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-6 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h4 className="font-bold text-lg mb-2">SkillSwap</h4>
          <p>Empowering communities through shared knowledge and collaboration.</p>
        </div>

        <div>
          <h4 className="font-bold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li className="hover:underline cursor-pointer">Home</li>
            <li className="hover:underline cursor-pointer">Browse Skills</li>
            <li className="hover:underline cursor-pointer">How It Works</li>
            <li className="hover:underline cursor-pointer">Community</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2">Contact</h4>
          <p>Email: support@skillswap.com</p>
          <p>Phone: +91-9876543210</p>
        </div>
      </div>

      <div className="text-center text-sm text-blue-200 mt-6">
        © {new Date().getFullYear()} SkillSwap. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
