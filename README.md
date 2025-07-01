# 📄 Resume Builder Web Application

A modern, full-stack web application for creating and downloading professional resumes. Built with React, Express.js, and SQLite.

## ✨ Features

- **User Authentication**: Sign up/Sign in with email or mobile number
- **Resume Builder**: Create professional resumes with multiple sections
- **Voice Input**: Use speech-to-text for hands-free data entry
- **PDF Export**: Download resumes as high-quality PDF files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **One Resume Per User**: Each user can maintain one comprehensive resume

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **React Router** for navigation
- **Lucide React** for icons
- **Web Speech API** for voice input
- **jsPDF & html2canvas** for PDF generation

### Backend
- **Express.js** with ES6 modules
- **SQLite** with better-sqlite3
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd resume-builder
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# SQLite database file path (automatically created)
DATABASE_PATH=./server/data/resume_builder.db

# JWT secret for authentication (change this in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server port
PORT=3001

# File upload settings
MAX_FILE_SIZE=5242880

# OTP settings (optional - for SMS services like Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 4. Start the Application

#### Option A: Run Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option B: Run Separately
```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the frontend development server
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🧪 Test Accounts

The application comes with pre-seeded test accounts:

| Email | Mobile | Password | Notes |
|-------|--------|----------|-------|
| `test@example.com` | - | `password123` | Has sample resume |
| `jane@example.com` | `+1234567890` | `password123` | Empty profile |
| - | `+9876543210` | `demo123` | Mobile-only account |

## 📁 Project Structure

```
resume-builder/
├── public/                 # Static assets
├── src/                   # Frontend source code
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared components
│   │   └── resume/       # Resume-related components
│   ├── context/          # React context providers
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── server/               # Backend source code
│   ├── database/         # Database operations
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   └── data/             # SQLite database files
├── uploads/              # User uploaded files
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start backend server |
| `npm run dev:full` | Start both frontend and backend |
| `npm run lint` | Run ESLint |

## 🗄️ Database

The application uses **SQLite** as the database:

- **Location**: `./server/data/resume_builder.db`
- **Auto-created**: Database and tables are created automatically
- **Test Data**: Sample users and resume data are seeded on first run

### Database Schema

#### Users Table
- `id` - Primary key
- `fullName` - User's full name
- `email` - Email address (optional)
- `mobile` - Mobile number (optional)
- `password` - Hashed password
- `photo` - Profile photo path
- `language` - Preferred language
- `isEmailVerified` - Email verification status
- `isMobileVerified` - Mobile verification status
- `otpCode` - OTP for verification
- `otpExpires` - OTP expiration time

#### Resumes Table
- `id` - Primary key
- `userId` - Foreign key to users table
- `personalInfo` - JSON string of personal information
- `summary` - Professional summary
- `education` - JSON string of education entries
- `experience` - JSON string of work experience
- `skills` - JSON string of skills array

## 🎤 Voice Input Feature

The application includes voice input functionality:

- **Browser Support**: Chrome, Edge, Safari (with webkit)
- **Language**: English (US) by default
- **Usage**: Click the microphone icon next to form fields
- **Permissions**: Browser will request microphone access

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **File Upload Validation**: Image type and size restrictions
- **SQL Injection Protection**: Prepared statements
- **CORS Configuration**: Cross-origin request handling

## 🚀 Production Deployment

### Environment Variables
Set these environment variables in production:

```env
NODE_ENV=production
JWT_SECRET=your-very-secure-secret-key
PORT=3001
DATABASE_PATH=/path/to/production/database.db
```

### Build Steps
```bash
# Install dependencies
npm install --production

# Build frontend
npm run build

# Start production server
npm run server
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database Permission Issues**
   ```bash
   # Ensure data directory exists and is writable
   mkdir -p server/data
   chmod 755 server/data
   ```

3. **Voice Input Not Working**
   - Ensure you're using HTTPS or localhost
   - Check browser microphone permissions
   - Try Chrome or Edge browsers

4. **File Upload Issues**
   ```bash
   # Ensure uploads directory exists
   mkdir -p uploads
   chmod 755 uploads
   ```

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## 📝 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/send-otp` | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Verify OTP |

### Resume Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resume` | Get user's resume |
| POST | `/api/resume` | Create/update resume |
| PUT | `/api/resume` | Update existing resume |
| DELETE | `/api/resume` | Delete user's resume |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are installed correctly
4. Verify environment variables are set properly

---

**Happy Resume Building! 🎉**