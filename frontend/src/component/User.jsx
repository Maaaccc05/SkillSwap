import React, { useState, useEffect } from "react";
import { FaPen, FaSave, FaTimes, FaUserCircle, FaMapMarkerAlt, FaCamera } from "react-icons/fa";
import Navbar from "../basic/Navbar";
import Footer from "../basic/Footer";

const INIT = {
  name: "",
  location: "",
  avatar: "",
  offers: [],
  wants: [],
  availability: [],
  public: true,
  bio: "",
  rating: 0,
  totalReviews: 0
};

export default function UserDashboard() {
  const [profile, setProfile] = useState(INIT);
  const [draft, setDraft] = useState(INIT);
  const [isEditing, setIsEditing] = useState(false);
  const [popup, setPopup] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:5001/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const user = await res.json();
      // Map backend fields to frontend expected fields
      const mappedUser = {
        ...user,
        offers: user.skillsOffered && Array.isArray(user.skillsOffered) ? user.skillsOffered.map(s => s.name) : [],
        wants: user.skillsWanted && Array.isArray(user.skillsWanted) ? user.skillsWanted.map(s => s.name) : [],
        availability: user.availability && Array.isArray(user.availability) ? user.availability : []
      };
      setProfile(mappedUser);
      setDraft(mappedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPopup("Not authenticated. Please login again.");
        return;
      }
      
      // Validate required fields
      if (!draft.name?.trim()) {
        setPopup("Name is required.");
        return;
      }
      
      // Map frontend fields back to backend format
      const backendData = {
        name: draft.name.trim(),
        location: draft.location?.trim() || "",
        bio: draft.bio?.trim() || "",
        avatar: draft.avatar || null,
        skillsOffered: draft.offers && Array.isArray(draft.offers) ? draft.offers.filter(skill => skill.trim()).map(skill => ({
          name: skill.trim(),
          category: "General",
          level: "intermediate",
          description: `I can teach ${skill.trim()}`
        })) : [],
        skillsWanted: draft.wants && Array.isArray(draft.wants) ? draft.wants.filter(skill => skill.trim()).map(skill => ({
          name: skill.trim(),
          category: "General", 
          level: "beginner",
          description: `I want to learn ${skill.trim()}`
        })) : [],
        availability: draft.availability ? draft.availability.map(avail => 
          avail.toLowerCase().replace(/\s+/g, '')
        ).filter(avail => 
          ['weekdays', 'weekends', 'mornings', 'evenings', 'flexible'].includes(avail)
        ) : []
      };
      
      console.log('Sending to backend:', backendData);
      
      const res = await fetch("http://localhost:5001/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      const updated = await res.json();
      console.log('Backend response:', updated);
      
      // Map updated data back to frontend format
      const mappedUpdated = {
        ...updated,
        offers: updated.skillsOffered ? updated.skillsOffered.map(s => s.name) : [],
        wants: updated.skillsWanted ? updated.skillsWanted.map(s => s.name) : [],
        availability: updated.availability || []
      };
      
      console.log('Mapped updated data:', mappedUpdated);
      
      setProfile(mappedUpdated);
      setDraft(mappedUpdated);
      setIsEditing(false);
      setPopup("Profile updated successfully!");
      
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...mappedUpdated };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (err) {
      console.error('Save error:', err);
      setPopup(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
    setPopup("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setDraft((prev) => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
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
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <FaSave className="text-sm" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      <FaTimes className="text-sm" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaPen className="text-sm" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <img
                  src={draft.avatar || "https://placehold.co/120x120/6366F1/FFFFFF?text=U"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                    <FaCamera className="text-sm" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <Field
                  label="Name"
                  value={draft.name}
                  isEditing={isEditing}
                  onChange={(value) => setDraft(prev => ({ ...prev, name: value }))}
                  icon={<FaUserCircle />}
                />
                <Field
                  label="Location"
                  value={draft.location}
                  isEditing={isEditing}
                  onChange={(value) => setDraft(prev => ({ ...prev, location: value }))}
                  icon={<FaMapMarkerAlt />}
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={draft.bio || ""}
                  onChange={(e) => setDraft(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600">{draft.bio || "No bio added yet."}</p>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <SkillBlock
              title="Skills I Offer"
              color="green"
              skills={draft.offers || []}
              isEditing={isEditing}
              onRemove={(skill) => {
                console.log('Removing skill from offers:', skill);
                setDraft(prev => ({ 
                  ...prev, 
                  offers: (prev.offers || []).filter(s => s !== skill) 
                }));
              }}
              onAdd={(skill) => {
                console.log('Adding skill to offers:', skill);
                setDraft(prev => ({ 
                  ...prev, 
                  offers: [...(prev.offers || []), skill] 
                }));
              }}
            />
            <SkillBlock
              title="Skills I Want"
              color="blue"
              skills={draft.wants || []}
              isEditing={isEditing}
              onRemove={(skill) => {
                console.log('Removing skill from wants:', skill);
                setDraft(prev => ({ 
                  ...prev, 
                  wants: (prev.wants || []).filter(s => s !== skill) 
                }));
              }}
              onAdd={(skill) => {
                console.log('Adding skill to wants:', skill);
                setDraft(prev => ({ 
                  ...prev, 
                  wants: [...(prev.wants || []), skill] 
                }));
              }}
            />
          </div>

                      {/* Availability Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "weekdays", label: "Weekdays" },
                  { value: "weekends", label: "Weekends" },
                  { value: "mornings", label: "Mornings" },
                  { value: "evenings", label: "Evenings" },
                  { value: "flexible", label: "Flexible" }
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={draft.availability.includes(value)}
                      onChange={() => {
                        if (isEditing) {
                          setDraft(prev => ({
                            ...prev,
                            availability: prev.availability.includes(value)
                              ? prev.availability.filter(t => t !== value)
                              : [...prev.availability, value]
                          }));
                        }
                      }}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <p className="text-center mb-4">{popup}</p>
            <button
              onClick={() => setPopup("")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const Field = ({ label, value, isEditing, onChange, icon }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {isEditing ? (
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">{icon}</span>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    ) : (
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-gray-900">{value || "Not specified"}</span>
      </div>
    )}
  </div>
);

const SkillBlock = ({
  title,
  color,
  skills,
  isEditing,
  onRemove,
  onAdd,
}) => {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      onAdd(trimmedSkill);
      setNewSkill("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className={`text-xl font-semibold text-${color}-900 mb-4`}>{title}</h3>
      
      {/* Skills List */}
      <div className="space-y-2 mb-4">
        {skills.map((skill) => (
          <div key={skill} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-gray-700">{skill}</span>
            {isEditing && (
              <button
                onClick={() => onRemove(skill)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-gray-500 text-sm italic">No skills added yet.</p>
        )}
      </div>

      {/* Add New Skill */}
      {isEditing && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a skill..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newSkill.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};
