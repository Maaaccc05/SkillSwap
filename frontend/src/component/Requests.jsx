import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUser, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/skills/requests/received', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (skillOfferId, requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/skills/${skillOfferId}/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Request ${status} successfully!`);
        fetchRequests(); // Refresh the list
      } else {
        alert('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const startChat = async (requesterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: requesterId })
      });

      if (response.ok) {
        const chatData = await response.json();
        navigate(`/chat/${chatData._id}`);
      } else {
        alert('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Skill Requests</h1>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">When people request your skills, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((skillOffer) => (
              <div key={skillOffer._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {skillOffer.skill.name} - {skillOffer.skill.level}
                    </h3>
                    <p className="text-gray-600 mb-4">{skillOffer.description}</p>
                    
                    <div className="space-y-3">
                      {skillOffer.requests
                        .filter(request => request.status === 'pending')
                        .map((request) => (
                          <div key={request._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={request.requester?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                                  alt={request.requester?.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {request.requester?.name || 'Unknown User'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {request.requester?.location || 'Location not specified'}
                                  </p>
                                  {request.requester?.rating && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <FaStar className="text-yellow-400" />
                                      <span>{request.requester.rating}/5</span>
                                      <span>({request.requester.totalReviews || 0} reviews)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startChat(request.requester._id)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Chat
                                </button>
                              </div>
                            </div>
                            
                            {request.message && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <p className="text-sm text-gray-700">{request.message}</p>
                              </div>
                            )}
                            
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() => handleRequest(skillOffer._id, request._id, 'accepted')}
                                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                <FaCheck className="text-xs" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRequest(skillOffer._id, request._id, 'declined')}
                                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                <FaTimes className="text-xs" />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests; 