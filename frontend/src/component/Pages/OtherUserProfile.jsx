import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OtherUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-600">Loading profile...</div>;
  if (error || !user) return <div className="flex min-h-screen items-center justify-center text-red-600">{error || "User not found"}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <button
          onClick={() => navigate("/home")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>

        {/* header */}
        <div className="flex items-start gap-6 border-b pb-6 mt-4">
          <img
            src={user.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-indigo-500"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.rating && <p className="text-yellow-500">★ {user.rating} / 5</p>}
            {user.location && <p className="text-gray-500 mt-1">{user.location}</p>}
          </div>
        </div>

        <InfoGroup title="Offers" color="blue" list={user.skillsOffered ? user.skillsOffered.map(s => s.name) : []} />
        <InfoGroup title="Wants" color="purple" list={user.skillsWanted ? user.skillsWanted.map(s => s.name) : []} />
        <InfoGroup title="Availability" color="gray" list={user.availability || []} />
        {user.bio && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-700">Bio</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-line">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const InfoGroup = ({ title, list, color }) => {
  const style =
    color === "blue"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : color === "purple"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {list && list.length > 0 ? (
          list.map((item) => (
            <span
              key={item}
              className={`text-sm font-medium px-3 py-1 rounded-full border ${style}`}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">None</span>
        )}
      </div>
    </div>
  );
};
