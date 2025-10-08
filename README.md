# SkillSwap - Advanced Skill Exchange Platform

A modern web application that allows users to exchange skills with each other through real-time chat and skill management. Built with React (frontend) and Node.js/Express (backend) with comprehensive chat functionality.

## Features

- **Advanced User Authentication**: Secure JWT-based authentication with user profiles
- **Real-time Private Chat**: Direct messaging between users for skill discussions
- **Skill Management**: Create, offer, and request skills with detailed descriptions
- **User Profiles**: Comprehensive profiles with skills offered/wanted, ratings, and availability
- **Skill Requests**: Request and respond to skill offers with messaging
- **Online Status**: Real-time online/offline status tracking
- **Rating System**: Rate users after skill exchanges
- **Search & Filter**: Find users by skills, location, and availability
- **Responsive Design**: Modern UI built with Tailwind CSS

## Project Structure

```
odoo/
├── backend/          # Enhanced Node.js/Express server
│   ├── config/      # Database configuration
│   ├── models/      # MongoDB models (User, Chat, Skill)
│   ├── routes/      # API routes (auth, chat, skills, users)
│   ├── middleware/  # Authentication middleware
│   └── server.js    # Main server with Socket.io
└── frontend/        # React application
    ├── src/
    │   ├── basic/   # Basic components (Header, Footer, Navbar)
    │   ├── component/ # Main components
    │   └── App.jsx  # Main app component
    └── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/skillswap
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5001
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:5001`

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:userId` - Get public user profile
- `GET /api/users/search` - Search users
- `GET /api/users/online` - Get online users
- `POST /api/users/:userId/rate` - Rate a user

### Chat System
- `GET /api/chat` - Get all chats
- `GET /api/chat/:chatId` - Get specific chat
- `POST /api/chat/start` - Start new chat
- `POST /api/chat/:chatId/messages` - Send message
- `PUT /api/chat/:chatId/read` - Mark messages as read

### Skills Management
- `GET /api/skills` - Get all skill offers
- `POST /api/skills` - Create skill offer
- `POST /api/skills/:skillOfferId/request` - Request a skill
- `PUT /api/skills/:skillOfferId/request/:requestId` - Respond to request
- `GET /api/skills/requests/my` - Get user's requests
- `GET /api/skills/requests/received` - Get received requests

### WebSocket Events
- `authenticate` - Authenticate socket connection
- `private_message` - Send/receive private messages
- `typing_start/typing_stop` - Typing indicators
- `skill_request` - Send skill requests
- `user_online/user_offline` - Online status updates

## Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run server` - Start the development server with nodemon

### Frontend
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

### Root
- `npm run setup` - Run the setup script
- `npm run dev` - Start both frontend and backend in development
- `npm run install:all` - Install all dependencies

## Key Features

### Advanced Chat System
- Private messaging between users
- Real-time message delivery
- Typing indicators
- Message read status
- Chat history persistence
- Skill-specific messaging

### Skill Management
- Create detailed skill offers
- Request skills from other users
- Accept/decline skill requests
- Track skill exchange status
- Skill categories and levels
- Availability scheduling

### User Profiles
- Comprehensive profile information
- Skills offered and wanted
- Availability preferences
- Rating and review system
- Online status tracking
- Profile privacy settings

### Real-time Features
- Live online status updates
- Instant message delivery
- Real-time typing indicators
- Skill request notifications
- User activity tracking

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 19 with hooks
- React Router for navigation
- Socket.io-client for real-time features
- Tailwind CSS for styling
- React Icons
- Vite for build tooling

## Database Models

### User
- Basic info (name, email, password)
- Profile details (avatar, location, bio)
- Skills (offered and wanted)
- Availability preferences
- Rating system
- Online status

### Chat
- Participants (user IDs)
- Messages with timestamps
- Message types (text, skill_request, etc.)
- Read status tracking

### SkillOffer
- Skill details (name, category, level)
- User offering the skill
- Description and availability
- Request management
- Status tracking

## Development Notes

- MongoDB is used for data persistence
- Real-time features use Socket.io
- JWT tokens for secure authentication
- Comprehensive error handling
- Input validation and sanitization
- Database indexing for performance
- CORS configured for frontend integration

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running locally or update the MONGO_URI in the .env file
2. **Port Conflicts**: Change the PORT in the .env file if port 5001 is already in use
3. **CORS Issues**: The backend is configured to accept requests from `http://localhost:5173`
4. **Socket Connection**: Ensure both frontend and backend are running for chat functionality
5. **Authentication Issues**: Check JWT_SECRET in .env file and ensure tokens are properly sent

## API Documentation

For detailed API documentation, see `backend/API_DOCUMENTATION.md`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. # SkillSwap
