# SkillSwap Testing Guide

## 🚀 **Application is Now Running!**

- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:5173

## 📋 **Test Accounts (All use password: `password123`)**

1. **Sarah Chen** - sarah@example.com (JavaScript, React expert)
2. **Marcus Johnson** - marcus@example.com (Photoshop, Illustrator expert)
3. **Emily Rodriguez** - emily@example.com (Spanish, Content Writing)
4. **David Kim** - david@example.com (Node.js, MongoDB expert)
5. **Lisa Thompson** - lisa@example.com (Marketing, SEO expert)

## 🧪 **Testing Steps**

### 1. **Landing Page**
- Visit http://localhost:5173
- You should see the SkillSwap landing page with hero section and features

### 2. **User Registration & Login**
- Click "Join Now" or "Sign In"
- Test with any of the dummy accounts above
- Example: Login with `sarah@example.com` / `password123`

### 3. **Browse Skills (Home Page)**
- After login, you'll see the home page with user cards
- Each card shows:
  - User avatar and name
  - Rating and reviews
  - Skills offered and wanted
  - Availability
  - Online status indicator

### 4. **Search & Filter**
- Use the search bar to find specific skills (e.g., "JavaScript", "Photoshop")
- Use the availability filter (Weekdays, Weekends, etc.)
- Test pagination if there are many results

### 5. **Skill Requests**
- Click "Request Skill" on any user card
- Enter a message about why you want to learn that skill
- The request will be sent to the skill owner

### 6. **Chat System**
- Click "Start Chat" on any user card
- You'll be redirected to a chat interface
- Send messages and see them appear in real-time
- Test the back button to return to home

### 7. **Profile Management**
- Click the profile icon in the navbar (top right)
- Select "My Profile" to edit your profile
- Add skills you offer and want to learn
- Set your availability preferences

### 8. **Request Management**
- Click the bell icon in the navbar
- You'll see incoming skill requests
- Test Accept/Decline buttons
- Click "Chat" to start a conversation with the requester

### 9. **Real-time Features**
- Open multiple browser tabs/windows
- Login with different accounts
- Test chat functionality between users
- Check online status indicators

## 🔧 **Key Features to Test**

### ✅ **Authentication**
- [ ] User registration
- [ ] User login
- [ ] Token storage
- [ ] Logout functionality
- [ ] Protected routes

### ✅ **User Profiles**
- [ ] Profile display
- [ ] Profile editing
- [ ] Skills management
- [ ] Avatar display
- [ ] Rating system

### ✅ **Skill Exchange**
- [ ] Browse users
- [ ] Search and filter
- [ ] Request skills
- [ ] Accept/decline requests
- [ ] Skill descriptions

### ✅ **Chat System**
- [ ] Start conversations
- [ ] Send messages
- [ ] Real-time messaging
- [ ] Chat history
- [ ] User online status

### ✅ **Navigation**
- [ ] Navbar with profile dropdown
- [ ] Requests notification icon
- [ ] Responsive design
- [ ] Route protection

## 🐛 **Troubleshooting**

### **If Backend Won't Start**
1. Check if MongoDB is running
2. Verify .env file exists in backend folder
3. Run `npm install` in backend directory

### **If Frontend Won't Start**
1. Run `npm install` in frontend directory
2. Check if port 5173 is available
3. Verify all dependencies are installed

### **If Database is Empty**
1. Run `npm run seed` in backend directory
2. Check MongoDB connection
3. Verify .env file has correct MONGO_URI

### **If Chat Doesn't Work**
1. Ensure both frontend and backend are running
2. Check browser console for errors
3. Verify Socket.io connection

## 📱 **Mobile Testing**
- Test responsive design on mobile devices
- Check touch interactions
- Verify chat works on mobile browsers

## 🎯 **Expected Behavior**

1. **After Login**: User sees home page with skill cards
2. **Profile Icon**: Shows user avatar and dropdown menu
3. **Bell Icon**: Shows notification for skill requests
4. **Chat**: Real-time messaging between users
5. **Requests**: Accept/decline skill requests with chat option

## 🚀 **Quick Test Scenario**

1. Login as `sarah@example.com` (password: `password123`)
2. Browse the home page to see other users
3. Click "Request Skill" on Marcus Johnson's card
4. Enter a message about learning Photoshop
5. Login as `marcus@example.com` (password: `password123`)
6. Click the bell icon to see the request
7. Click "Accept" and then "Chat"
8. Send messages in the chat interface

This tests the complete skill exchange workflow!

## 📞 **Support**

If you encounter any issues:
1. Check browser console for errors
2. Verify both servers are running
3. Ensure MongoDB is connected
4. Check network connectivity

**Happy Testing! 🎉** 