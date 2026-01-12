# MetaPins - Pinterest Clone Project Documentation

## 🎯 Project Overview

MetaPins is a full-stack Pinterest-inspired visual discovery platform built with modern web technologies. The application allows users to discover, save, organize, and share visual content through an intuitive and aesthetically pleasing interface.

**Live Demo:** https://meta-pins.vercel.app  
**Backend API:** https://metapins-production-c951.up.railway.app

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Vanilla CSS with CSS Variables
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer + Cloudinary
- **Deployment:** Railway

### Key Features Implemented

#### 1. **User Authentication & Authorization**
- JWT-based authentication system
- Secure password hashing
- Protected routes and API endpoints
- Session persistence with localStorage

#### 2. **Pin Management**
- Upload images with metadata (title, description, tags, category, color)
- Cloudinary integration for image hosting
- Pin discovery feed with masonry grid layout
- Individual pin detail modal with full information

#### 3. **Multi-Board System**
- Create custom boards for organizing pins
- Save pins to specific boards
- Board management (create, view, delete)
- Legacy moodboard support for backward compatibility

#### 4. **Social Features**
- Follow/unfollow users
- View followers and following lists
- Public vs. private profile views
- User-to-user interactions through comments

#### 5. **Engagement System**
- Like/unlike pins
- Save pins to boards
- Comment on pins with real-time updates
- Engagement tracking for analytics

#### 6. **Search & Discovery**
- Text-based search across pins
- Tag-based filtering
- Category organization
- Color-based discovery

#### 7. **User Profiles**
- Personal profile with uploaded pins
- Saved pins collection (private)
- Board collections (private)
- Public profile view for other users
- Follower/following counts and lists

#### 8. **Visual Similarity Search**
- AI-powered similar pin recommendations
- Color and tag-based similarity scoring
- Visual discovery enhancement

---

## 🎨 Design Philosophy

### UI/UX Principles
1. **Premium Aesthetics:** Modern, clean interface with glassmorphism effects
2. **Responsive Design:** Fully responsive masonry grid layout
3. **Smooth Animations:** Micro-interactions and transitions for better UX
4. **Accessibility:** Semantic HTML and keyboard navigation support
5. **Performance:** Optimized image loading and lazy loading

### Design System
- **Typography:** Outfit font family from Google Fonts
- **Color Palette:**
  - Primary: Pinterest Red (#e60023)
  - Background: Pure White (#ffffff)
  - Text: Dark Gray (#111111)
  - Secondary Text: Medium Gray (#5f5f5f)
- **Shadows:** Layered shadow system (sm, md, lg)
- **Border Radius:** Consistent 24px-40px for modern look

---

## 🔐 Security Features

1. **Authentication Security**
   - JWT tokens with expiration
   - Password hashing (not stored in plain text)
   - Protected API routes with middleware

2. **Authorization**
   - Owner-based access control for private data
   - CORS configuration for allowed origins
   - Token validation on every protected request

3. **Data Privacy**
   - Private boards only visible to owner
   - Saved pins hidden from public view
   - User email addresses not exposed in public profiles

---

## 📊 Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  name: String,
  avatarUrl: String,
  uploaded: [Pin IDs],
  savedPins: [Pin IDs],
  moodBoard: [Pin IDs], // Legacy support
  likes: [Pin IDs],
  followers: [User IDs],
  following: [User IDs],
  followersCount: Number,
  followingCount: Number,
  interests: Map // For personalized feed
}
```

### Pin Model
```javascript
{
  title: String,
  description: String,
  imageUrl: String (Cloudinary URL),
  category: String,
  tags: [String],
  color: String,
  user: User ID,
  createdAt: Date
}
```

### Board Model
```javascript
{
  title: String,
  description: String,
  user: User ID,
  pins: [Pin IDs],
  createdAt: Date
}
```

### Comment Model
```javascript
{
  pin: Pin ID,
  user: User ID,
  text: String,
  createdAt: Date
}
```

---

## 🚀 Deployment Guide

### Environment Variables

**Frontend (Vercel):**
```
VITE_API_URL=https://metapins-production-c951.up.railway.app
```

**Backend (Railway):**
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
FRONTEND_URL=https://meta-pins.vercel.app
PORT=5000
```

### Deployment Steps

1. **Backend (Railway)**
   - Connect GitHub repository
   - Set environment variables
   - Deploy from main branch

2. **Frontend (Vercel)**
   - Connect GitHub repository
   - Set root directory to `frontend`
   - Add `VITE_API_URL` environment variable
   - Deploy

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Ensure `FRONTEND_URL` is set in backend and matches your Vercel deployment URL

### Issue 2: Upload Failures
**Solution:** Verify Cloudinary credentials are correctly set in Railway

### Issue 3: Profile Not Visible
**Solution:** Check that JWT token is valid and Authorization header is included in requests

### Issue 4: Environment Variables Not Working
**Solution:** Redeploy after adding/changing environment variables in Vercel/Railway

---

## 📈 Future Enhancements

### Planned Features
1. **Advanced Search**
   - Visual search using image upload
   - Advanced filters (date, popularity, etc.)

2. **Notifications**
   - Real-time notifications for likes, comments, follows
   - Email notifications for important events

3. **Collections**
   - Collaborative boards
   - Board sharing and permissions

4. **Analytics**
   - Pin performance metrics
   - User engagement analytics
   - Trending content discovery

5. **Mobile App**
   - React Native mobile application
   - Push notifications
   - Offline support

---

## 🎓 Key Learnings

### Technical Learnings
1. **Full-Stack Integration:** Seamless communication between React frontend and Express backend
2. **State Management:** Efficient state synchronization across components
3. **Authentication Flow:** Implementing secure JWT-based auth
4. **File Upload:** Handling multipart form data and cloud storage
5. **Database Design:** Modeling relationships in MongoDB
6. **Deployment:** Managing environment-specific configurations

### Best Practices
1. **Code Organization:** Modular component structure
2. **Error Handling:** Comprehensive error messages and logging
3. **Security:** Never expose sensitive data or credentials
4. **Performance:** Optimize images and lazy load content
5. **User Experience:** Smooth transitions and immediate feedback

---

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token

### Pin Endpoints
- `GET /api/pins` - Get all pins (with optional user-based ranking)
- `POST /api/pins` - Upload new pin (requires auth)
- `GET /api/pins/:id` - Get single pin details
- `POST /api/pins/:id/comments` - Add comment to pin

### User Endpoints
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/boards` - Get user's boards (owner only)
- `POST /api/users/:username/boards` - Create new board
- `POST /api/users/:username/follow/:targetUsername` - Toggle follow

### Board Endpoints
- `POST /api/users/:username/boards/:boardId/pins` - Add pin to board
- `DELETE /api/users/:username/boards/:boardId/pins/:pinId` - Remove pin from board
- `DELETE /api/users/:username/boards/:boardId` - Delete board

---

## 🏆 Project Achievements

✅ Full-stack application with modern tech stack  
✅ Secure authentication and authorization  
✅ Beautiful, responsive UI with premium design  
✅ Multi-board organization system  
✅ Social features (follow, like, comment)  
✅ Cloud-based image storage  
✅ Successfully deployed to production  
✅ Environment-specific configuration  
✅ Comprehensive error handling  
✅ Type-safe frontend with TypeScript  

---

## 👥 Credits

**Developer:** Afsheen Mahmood  
**Project Type:** Full-Stack Web Application  
**Duration:** December 2025  
**Technologies:** MERN Stack (MongoDB, Express, React, Node.js)

---

## 📞 Support & Contact

For issues, questions, or contributions:
- GitHub: https://github.com/AfsheenMahmood/MetaPins
- Email: afsheen.mahmood27@gmail.com

---

*Last Updated: December 28, 2025*
