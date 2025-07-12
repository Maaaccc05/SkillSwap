import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addRequest, getRequests, updateStatus } from "../../utils/swapStore";

// Logged-in user (Sarah Johnson)
const currentUser = {
  id: 0,
  name: "Sarah Johnson",
  avatar: "https://placehold.co/120x120/6366F1/FFFFFF?text=SJ",
  offers: ["Web Development", "UI/UX Design", "Photography"],
};

// Mock profile you clicked
const mockUser = {
  id: 1,
  name: "Sarah Chen",
  avatar: "https://randomuser.me/api/portraits/women/40.jpg",
  rating: 4.8,
  offers: ["JavaScript", "React", "Node.js"],
  wants: ["UI Design", "Figma"],
  availability: ["Weekends", "Evenings"],
};

export default function OtherUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = parseInt(userId) === mockUser.id ? mockUser : null;

  const [reqs, setReqs] = useState(getRequests());
  const [showModal, setShowModal] = useState(false);
  const [giveSkill, setGiveSkill] = useState("");
  const [takeSkill, setTakeSkill] = useState("");

  const existing = reqs.find(
    (r) =>
      r.senderId === currentUser.id &&
      r.recipientId === user?.id &&
      r.status !== "Cancelled"
  );

  const [requestSent, setRequestSent] = useState(!!existing);
  const selfProfile = currentUser.id === user?.id;

  useEffect(() => {
    setReqs(getRequests());
  }, []);

  const confirmRequest = () => {
    addRequest({
      id: Date.now(),
      senderId: currentUser.id,
      recipientId: user.id,
      recipientName: user.name,
      recipientAvatar: user.avatar,
      rating: user.rating,
      giveSkill,
      takeSkill,
      status: "Pending",
    });
    setShowModal(false);
    setRequestSent(true);
    setReqs(getRequests());
  };

  const cancelRequest = () => {
    if (existing) {
      updateStatus(existing.id, "Cancelled");
      setReqs(getRequests());
      setRequestSent(false);
      setGiveSkill("");
      setTakeSkill("");
    }
  };

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        User not found
      </div>
    );

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
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-indigo-500"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-yellow-500">★ {user.rating} / 5</p>
          </div>
        </div>

        <InfoGroup title="Offers" color="blue" list={user.offers} />
        <InfoGroup title="Wants" color="purple" list={user.wants} />
        <InfoGroup title="Availability" color="gray" list={user.availability} />

        {!selfProfile && (
          <div className="mt-8 flex flex-col gap-3">
            {requestSent ? (
              <>
                <button
                  disabled
                  className="w-full py-2 rounded-lg font-medium bg-green-600 text-white"
                >
                  Request Pending ✓
                </button>
                <button
                  onClick={cancelRequest}
                  className="w-full py-2 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-50 text-sm"
                >
                  Cancel Request
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-2 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Send Swap Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Choose Skills</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Skill I want</label>
                <select
                  value={takeSkill}
                  onChange={(e) => setTakeSkill(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {user.offers.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Skill I offer</label>
                <select
                  value={giveSkill}
                  onChange={(e) => setGiveSkill(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {currentUser.offers.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!giveSkill || !takeSkill}
                onClick={confirmRequest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
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
        {list.map((item) => (
          <span
            key={item}
            className={`text-sm font-medium px-3 py-1 rounded-full border ${style}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
