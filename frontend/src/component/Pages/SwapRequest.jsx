import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../basic/navbar";
import { getRequests, updateStatus, addRequest } from "../../utils/swapStore";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const currentUserId = 0; // Sarah Johnson

const badge = (s) =>
  s === "Accepted"
    ? "bg-green-100 text-green-800"
    : s === "Rejected"
    ? "bg-red-100 text-red-800"
    : s === "Cancelled"
    ? "bg-gray-200 text-gray-600"
    : "bg-gray-100 text-gray-800"; // Pending

export default function SwapRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState("incoming");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const existing = getRequests();
    const hasTest = existing.some((r) => r.id === 9001);
    if (!hasTest) {
      const testRequest = {
        id: 9001,
        senderId: 99,
        senderName: "Alex Rivera",
        recipientId: 0,
        recipientName: "Sarah Johnson",
        recipientAvatar: "https://placehold.co/100x100/6366F1/FFFFFF?text=SJ",
        rating: 4.7,
        giveSkill: "Spanish Language",
        takeSkill: "Web Development",
        status: "Pending",
      };
      addRequest(testRequest);
    }
    setRequests(getRequests());
  }, []);

  const refresh = () => setRequests(getRequests());

  const changeStatus = (id, status) => {
    updateStatus(id, status);
    refresh();
  };

  const clearRequest = (id) => {
    const remaining = getRequests().filter((r) => r.id !== id);
    localStorage.setItem("swapRequests", JSON.stringify(remaining));
    refresh();
  };

  const displayed = requests
    .filter((r) =>
      view === "incoming"
        ? r.recipientId === currentUserId
        : r.senderId === currentUserId
    )
    .filter((r) => (filter === "All" ? true : r.status === filter))
    .filter((r) =>
      (r.recipientName || r.senderName || r.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto py-10 px-6">
        <h2 className="text-2xl font-semibold mb-1">Swap Requests</h2>
        <p className="text-slate-600 mb-6">
          {view === "incoming"
            ? "Manage requests you've received"
            : "Requests you've sent"}
        </p>

        {/* View toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView("incoming")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${
              view === "incoming"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-slate-700 hover:bg-gray-300"
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setView("sent")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${
              view === "sent"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-slate-700 hover:bg-gray-300"
            }`}
          >
            Sent
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative w-full sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-gray-100 px-4 py-2 text-sm"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <FaChevronDown className="absolute top-3 right-3 text-slate-500 text-xs pointer-events-none" />
          </div>

          <div className="relative flex-grow">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-slate-200 bg-gray-100 px-4 py-2 text-sm"
            />
            <FaSearch className="absolute top-3 right-3 text-slate-400" />
          </div>
        </div>

        {/* Requests list */}
        {displayed.length === 0 ? (
          <p className="text-center text-slate-500">No requests.</p>
        ) : (
          <div className="space-y-4 max-h-[650px] overflow-y-auto">
            {displayed.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={req.recipientAvatar}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {view === "incoming" ? req.senderName : req.recipientName}
                    </h3>
                    <p className="text-sm">
                      Offer: <b>{req.giveSkill}</b> &nbsp;•&nbsp; Want:{" "}
                      <b>{req.takeSkill}</b>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${badge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>

                  {/* Incoming actions */}
                  {view === "incoming" && req.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeStatus(req.id, "Accepted")}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => changeStatus(req.id, "Rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-md"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Sent actions */}
                  {view === "sent" && req.status === "Pending" && (
                    <button
                      onClick={() => changeStatus(req.id, "Cancelled")}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-md"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Clear for rejected/cancelled */}
                  {["Rejected", "Cancelled"].includes(req.status) && (
                    <button
                      onClick={() => clearRequest(req.id)}
                      className="border border-slate-300 hover:bg-slate-100 text-sm px-3 py-1.5 rounded-md"
                    >
                      Clear
                    </button>
                  )}

                  {/* Contact & Schedule */}
                  {req.status === "Accepted" && (
                    <button
                      onClick={() => navigate(`/schedule/${req.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-md"
                    >
                      Contact & Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
