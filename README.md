# Student Feedback System

A comprehensive full-stack web application built with the MERN stack for collecting and managing student feedback on courses.

## Features

### For Students
- User registration and authentication
- Profile management with optional profile picture upload
- Submit feedback for courses with ratings (1-5) and comments
- View and edit their own feedback submissions
- Responsive design for all devices

### For Administrators
- Separate admin authentication
- Dashboard with analytics and statistics
- View all feedback with filtering options (by course, rating, student)
- Export feedback data to CSV
- Manage students (view, block/unblock, delete)
- Full CRUD operations for courses
- Feedback trends and analytics

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image upload service (optional)

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## Project Structure

\`\`\`
student-feedback-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── .env.example          # Environment variables template
└── README.md
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
\`\`\`bash
cd server
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update the `.env` file with your configuration:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/student-feedback
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name (optional)
CLOUDINARY_API_KEY=your-cloudinary-api-key (optional)
CLOUDINARY_API_SECRET=your-cloudinary-api-secret (optional)
PORT=5000
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
\`\`\`bash
cd client
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /admin-login` - Admin login

### User Routes (`/api/users`)
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `PUT /change-password` - Change password (protected)

### Feedback Routes (`/api/feedback`)
- `POST /` - Submit new feedback (protected)
- `GET /my-feedback` - Get user's feedback (protected)
- `PUT /:id` - Update feedback (protected)
- `DELETE /:id` - Delete feedback (protected)

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Dashboard statistics (admin only)
- `GET /feedback` - All feedback with filters (admin only)
- `GET /feedback/export` - Export feedback to CSV (admin only)
- `GET /students` - Manage students (admin only)
- `PUT /students/:id/block` - Block/unblock student (admin only)
- `DELETE /students/:id` - Delete student (admin only)
- `GET /courses` - Get all courses (admin only)
- `POST /courses` - Create course (admin only)
- `PUT /courses/:id` - Update course (admin only)
- `DELETE /courses/:id` - Delete course (admin only)

## Database Models

### User Model
- name, email, password
- role (student/admin)
- phone, dateOfBirth, address
- profilePicture (optional)
- isBlocked (for admin control)

### Course Model
- name, code, description
- instructor, credits
- isActive status

### Feedback Model
- References to student and course
- rating (1-5), message
- Unique constraint per student-course pair

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes with middleware
- Admin-only route protection
- Account blocking functionality

## Development

### Running in Development Mode

1. Start MongoDB service
2. Run backend: `cd server && npm run dev`
3. Run frontend: `cd client && npm run dev`

### Building for Production

1. Build frontend:
\`\`\`bash
cd client && npm run build
\`\`\`

2. Start production server:
\`\`\`bash
cd server && npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
