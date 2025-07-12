import { useState, useEffect } from "react";
import { FaStar, FaUser, FaMapMarkerAlt, FaClock, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../basic/Navbar";
import Footer from "../basic/Footer";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const perPage = 6;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users/search');
      if (response.ok) {
        const userData = await response.json();
        // Map backend fields to frontend expected fields (keep full objects for offers/wants)
        const mappedUsers = userData.map(u => ({
          ...u,
          offers: u.skillsOffered ? u.skillsOffered : [],
          wants: u.skillsWanted ? u.skillsWanted : [],
        }));
        setUsers(mappedUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillRequest = async (skillOfferId, skillName) => {
    if (!isAuthenticated) {
      alert('Please login to request skills');
      navigate('/login');
      return;
    }

    const message = prompt(`What would you like to say about learning ${skillName}?`);
    if (!message) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/skills/${skillOfferId}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        alert('Skill request sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending skill request:', error);
      alert('Failed to send request');
    }
  };

  const handleStartChat = async (userId) => {
    if (!isAuthenticated) {
      alert('Please login to start a chat');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: userId })
      });

      if (response.ok) {
        const chatData = await response.json();
        navigate(`/chat/${chatData._id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const addSkillToProfile = () => {
    if (!isAuthenticated) {
      alert('Please login to add skills to your profile');
      navigate('/login');
      return;
    }
    navigate('/user');
  };

  const openProfile = (id) => navigate(`/profile/${id}`);

  // Filter users based on search criteria
  const filteredUsers = users.filter(user => {
    const matchesSkill = !skillQuery || 
      user.offers.some(skill => skill.name.toLowerCase().includes(skillQuery.toLowerCase())) ||
      user.wants.some(skill => skill.name.toLowerCase().includes(skillQuery.toLowerCase()));
    
    const matchesAvailability = !availability || 
      user.availability.some(avail => avail.toLowerCase().includes(availability.toLowerCase()));
    
    return matchesSkill && matchesAvailability;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + perPage);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Skill Partners</h1>
            <p className="text-lg text-gray-600 mb-6">
              Connect with people who can teach you new skills and learn from your expertise
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search for skills..."
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Filter by availability..."
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {!isAuthenticated && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <FaUser className="inline mr-2" />
                    Sign in to request skills and start conversations
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Users Grid */}
          {paginatedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onSkillRequest={handleSkillRequest}
                  onStartChat={handleStartChat}
                  onViewProfile={openProfile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {skillQuery || availability 
                  ? "Try adjusting your search criteria"
                  : "No users are available at the moment"
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Add Skills CTA */}
          {isAuthenticated && (
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Skills</h3>
                <p className="text-gray-600 mb-4">
                  Help others discover what you can teach and what you want to learn
                </p>
                <button
                  onClick={addSkillToProfile}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaPlus className="text-sm" />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function UserCard({ user, isAuthenticated, onSkillRequest, onStartChat, onViewProfile }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [realOffers, setRealOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offersError, setOffersError] = useState("");

  const handleRequestClick = async () => {
    setShowModal(true);
    setLoadingOffers(true);
    setOffersError("");
    try {
      const response = await fetch(`http://localhost:5001/api/skills?user=${user._id}`);
      if (response.ok) {
        const offers = await response.json();
        setRealOffers(offers);
        setSelectedSkill(offers.length > 0 ? offers[0]._id.toString() : "");
      } else {
        setOffersError("Could not load skills");
        setRealOffers([]);
        setSelectedSkill("");
      }
    } catch (err) {
      setOffersError("Could not load skills");
      setRealOffers([]);
      setSelectedSkill("");
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSendRequest = () => {
    const skillObj = realOffers.find(s => s._id.toString() === selectedSkill);
    if (skillObj) {
      onSkillRequest(skillObj._id, skillObj.skill.name);
      setShowModal(false);
      setSelectedSkill("");
      setRealOffers([]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSkill("");
    setRealOffers([]);
    setOffersError("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaStar className="text-yellow-400" />
              <span>{user.rating || "New"}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        {user.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <FaMapMarkerAlt />
            <span>{user.location}</span>
          </div>
        )}

        {/* Skills */}
        <div className="space-y-3 mb-4">
          <SkillPills
            label="Offers"
            color="green"
            skills={user.offers.map(s => s.name)}
            icon="💡"
          />
          <SkillPills
            label="Wants"
            color="blue"
            skills={user.wants.map(s => s.name)}
            icon="🎯"
          />
        </div>

        {/* Availability */}
        {user.availability && user.availability.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <FaClock />
            <span>{user.availability.map(avail =>
              avail.charAt(0).toUpperCase() + avail.slice(1)
            ).join(", ")}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewProfile(user._id)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            View Profile
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => onStartChat(user._id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Chat
              </button>
              <button
                onClick={handleRequestClick}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Request
              </button>
            </>
          )}
        </div>
      </div>
      {/* Modal for selecting skill to request */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h2 className="text-lg font-semibold mb-4">Select a Skill to Request</h2>
            {loadingOffers ? (
              <div className="text-gray-500 mb-4">Loading skills...</div>
            ) : offersError ? (
              <div className="text-red-500 mb-4">{offersError}</div>
            ) : realOffers.length === 0 ? (
              <div className="text-gray-500 mb-4">No skills available</div>
            ) : (
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
              >
                {realOffers.map(skill => (
                  <option key={skill._id} value={skill._id.toString()}>{skill.skill.name}</option>
                ))}
              </select>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!selectedSkill || realOffers.length === 0}
                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillPills({ label, color, skills, icon }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className={`px-3 py-1 text-xs rounded-full ${
              color === "green"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            +{skills.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
