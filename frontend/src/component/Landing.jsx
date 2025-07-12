import React from 'react';
import Header from "../basic/Header";
import Footer from '../basic/Footer';

const Landing = () => {
  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 max-w-7xl mx-auto">
        {/* Left Text */}
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
            Trade Skills, <br /> Build Community
          </h1>
          <p className="mt-4 text-gray-600">
            Connect with others to exchange skills, learn new talents, and grow together.
            No money required — just passion and knowledge.
          </p>
          <div className="mt-6 flex gap-4">
            <button className="bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800 transition">
              Start Swapping
            </button>
            <button className="border border-blue-700 text-blue-700 px-6 py-3 rounded hover:bg-blue-50 transition">
              ▶ Watch Demo
            </button>
          </div>
        </div>

        {/* Right Image Placeholder */}
        <div className="w-full md:w-[40%] h-64  mt-10 md:mt-0 flex items-center justify-center rounded-lg">
          <img className='h-80 ' src='https://storage.googleapis.com/uxpilot-auth.appspot.com/9766f825e1-778cda621de6b4caae4d.png'/>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 text-center grid grid-cols-2 md:grid-cols-4 gap-8 px-10 max-w-6xl mx-auto">
        <div>
          <p className="text-2xl font-bold text-blue-800">2,500+</p>
          <p className="text-gray-600">Active Members</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-800">1,200+</p>
          <p className="text-gray-600">Skills Exchanged</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-800">95%</p>
          <p className="text-gray-600">Success Rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-800">50+</p>
          <p className="text-gray-600">Skill Categories</p>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="py-16 px-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Popular Skills to Trade
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Discover what our community is sharing
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Programming",
              offers: "320+ offers",
              desc: "Learn web development, mobile apps, and more.",
            },
            {
              title: "Design",
              offers: "285+ offers",
              desc: "UI/UX, graphic design, and creative skills.",
            },
            {
              title: "Languages",
              offers: "195+ offers",
              desc: "Practice speaking with native speakers.",
            },
          ].map((skill) => (
            <div
              key={skill.title}
              className="border rounded-lg p-6 shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                {skill.title}
              </h3>
              <p className="text-sm text-blue-600 font-medium">{skill.offers}</p>
              <p className="mt-2 text-gray-600">{skill.desc}</p>
              <button className="mt-4 text-blue-700 font-medium hover:underline">
                Browse offers →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Community */}
      <section className="py-16 bg-gray-50 px-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Meet Our Community
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Connect with skilled individuals ready to share
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Sarah Chen',
              role: 'UX Designer & React Developer',
              skills: ['Design', 'React'],
              rating: '4.9 (127 reviews)',
            },
            {
              name: 'Marcus Johnson',
              role: 'Data Scientist & Guitar Teacher',
              skills: ['Python', 'Music'],
              rating: '4.8 (89 reviews)',
            },
            {
              name: 'Elena Rodriguez',
              role: 'Spanish Teacher & Photographer',
              skills: ['Spanish', 'Photography'],
              rating: '5.0 (156 reviews)',
            },
          ].map((member) => (
            <div
              key={member.name}
              className="border rounded-lg p-6 shadow hover:shadow-md transition text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <h3 className="text-lg font-semibold text-blue-800">
                {member.name}
              </h3>
              <p className="text-gray-600">{member.role}</p>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                {member.skills.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">⭐ {member.rating}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;