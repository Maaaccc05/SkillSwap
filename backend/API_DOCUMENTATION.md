# SkillSwap Backend API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/signup
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Management

#### GET /api/users/profile
Get current user's profile (requires auth)

#### PUT /api/users/profile
Update current user's profile (requires auth)
```json
{
  "name": "John Doe",
  "location": "San Francisco, CA",
  "bio": "Software developer passionate about teaching",
  "skillsOffered": [
    {
      "name": "JavaScript",
      "category": "Programming",
      "level": "advanced",
      "description": "Expert in modern JavaScript frameworks"
    }
  ],
  "skillsWanted": [
    {
      "name": "UI Design",
      "category": "Design",
      "level": "beginner",
      "description": "Want to learn basic UI design principles"
    }
  ],
  "availability": ["weekends", "evenings"]
}
```

#### GET /api/users/:userId
Get public user profile

#### GET /api/users/search
Search users
```
Query parameters:
- q: search term
- skill: skill name
- location: location
- availability: availability
```

#### GET /api/users/online
Get online users

#### PUT /api/users/online-status
Update online status (requires auth)
```json
{
  "isOnline": true
}
```

#### POST /api/users/:userId/rate
Rate a user (requires auth)
```json
{
  "rating": 5,
  "review": "Great teacher!"
}
```

### Chat System

#### GET /api/chat
Get all chats for current user (requires auth)

#### GET /api/chat/:chatId
Get specific chat with messages (requires auth)

#### POST /api/chat/start
Start a new chat (requires auth)
```json
{
  "otherUserId": "user_id_here"
}
```

#### POST /api/chat/:chatId/messages
Send a message (requires auth)
```json
{
  "content": "Hello! I'm interested in learning JavaScript",
  "messageType": "text",
  "skillInvolved": "JavaScript"
}
```

#### PUT /api/chat/:chatId/read
Mark messages as read (requires auth)

#### GET /api/chat/unread/count
Get unread message count (requires auth)

### Skills Management

#### GET /api/skills
Get all skill offers
```
Query parameters:
- category: skill category
- level: skill level
- availability: availability
```

#### GET /api/skills/user/:userId
Get skill offers by specific user

#### POST /api/skills
Create a skill offer (requires auth)
```json
{
  "skill": {
    "name": "JavaScript",
    "category": "Programming",
    "level": "advanced",
    "description": "Modern JavaScript frameworks"
  },
  "description": "I can teach React, Vue, and Node.js",
  "availability": ["weekends", "evenings"]
}
```

#### POST /api/skills/:skillOfferId/request
Request a skill (requires auth)
```json
{
  "message": "I'd love to learn JavaScript from you!"
}
```

#### PUT /api/skills/:skillOfferId/request/:requestId
Respond to skill request (requires auth)
```json
{
  "status": "accepted"
}
```

#### GET /api/skills/requests/my
Get user's skill requests (requires auth)

#### GET /api/skills/requests/received
Get requests for user's skill offers (requires auth)

#### PUT /api/skills/:skillOfferId
Update skill offer (requires auth)
```json
{
  "description": "Updated description",
  "availability": ["weekdays", "evenings"],
  "isActive": true
}
```

#### DELETE /api/skills/:skillOfferId
Delete skill offer (requires auth)

## WebSocket Events

### Client to Server

#### authenticate
Authenticate socket connection
```json
{
  "token": "jwt_token_here"
}
```

#### private_message
Send private message
```json
{
  "receiverId": "user_id",
  "content": "Hello!",
  "messageType": "text",
  "skillInvolved": "JavaScript"
}
```

#### typing_start
Start typing indicator
```json
{
  "receiverId": "user_id"
}
```

#### typing_stop
Stop typing indicator
```json
{
  "receiverId": "user_id"
}
```

#### skill_request
Send skill request
```json
{
  "receiverId": "user_id",
  "skillName": "JavaScript",
  "message": "I'd like to learn this skill"
}
```

### Server to Client

#### authenticated
Socket authentication successful
```json
{
  "userId": "user_id",
  "name": "John Doe"
}
```

#### auth_error
Socket authentication failed
```json
{
  "message": "Authentication failed"
}
```

#### private_message
Receive private message
```json
{
  "sender": "sender_id",
  "receiver": "receiver_id",
  "content": "Hello!",
  "messageType": "text",
  "skillInvolved": "JavaScript",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### message_sent
Message sent confirmation
```json
{
  "sender": "sender_id",
  "receiver": "receiver_id",
  "content": "Hello!",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### user_typing
User is typing
```json
{
  "userId": "user_id"
}
```

#### user_stopped_typing
User stopped typing
```json
{
  "userId": "user_id"
}
```

#### skill_request_received
Skill request received
```json
{
  "requesterId": "user_id",
  "skillName": "JavaScript",
  "message": "I'd like to learn this skill"
}
```

#### user_online
User came online
```json
{
  "userId": "user_id",
  "name": "John Doe"
}
```

#### user_offline
User went offline
```json
{
  "userId": "user_id"
}
```

## Error Responses

All endpoints return errors in the following format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Database Models

### User
- name, email, password (required)
- avatar, location, bio
- skillsOffered, skillsWanted (arrays)
- availability (array)
- rating, totalReviews
- isOnline, lastSeen
- preferences (object)

### Chat
- participants (array of user IDs)
- messages (array of message objects)
- lastMessage (date)
- isActive (boolean)

### SkillOffer
- user (user ID)
- skill (object with name, category, level, description)
- description (string)
- availability (array)
- isActive (boolean)
- requests (array of request objects)

## Environment Variables

Create a `.env` file in the backend directory:
```
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
``` 