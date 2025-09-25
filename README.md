# Chatbot Platform

A full-stack chatbot platform built with React, Node.js, Express, MongoDB, and OpenAI integration. This platform allows users to create multiple AI-powered chatbot projects with personalized configurations.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Project Management**: Create and manage multiple chatbot projects/agents
- **AI Chat Interface**: Real-time chat with OpenAI GPT models
- **Message History**: Persistent chat history for each project
- **User Isolation**: Secure data separation between users
- **Responsive UI**: Modern React TypeScript interface
- **Error Handling**: Graceful error handling with fallback responses

## 🏗️ Architecture

```
chatbot/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB models
│   │   ├── User.js         # User schema
│   │   ├── Project.js      # Project/agent schema
│   │   └── Chat.js         # Chat message schema
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── projects.js     # Project CRUD routes
│   │   └── chat.js         # Chat/AI integration
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT authentication
│   ├── validation/         # Input validation
│   │   └── schemas.js      # Joi validation schemas
│   └── server.js           # Express server setup
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   └── ProjectCard.tsx
│   │   ├── context/        # React context
│   │   │   └── AuthContext.tsx
│   │   ├── services/       # API services
│   │   │   └── api.ts
│   │   └── types/          # TypeScript types
│   │       └── index.ts
└── docs/                   # Documentation
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **OpenAI API** for AI responses
- **bcryptjs** for password hashing
- **Joi** for input validation

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for HTTP requests
- **Context API** for state management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chatbot
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatbot
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI responses | Yes |
| `PORT` | Backend server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |

### OpenAI Setup
1. Create account at [OpenAI Platform](https://platform.openai.com/)
2. Generate API key from API keys section
3. Add to `.env` file as `OPENAI_API_KEY`

### Database Setup

**Local MongoDB:**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# MongoDB will be available at mongodb://localhost:27017
```

**MongoDB Atlas:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Replace `<password>` and `<dbname>` in connection string
4. Add to `.env` as `MONGODB_URI`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Chat
- `POST /api/chat/:projectId` - Send message to AI
- `GET /api/chat/:projectId` - Get chat history

## 🎨 Usage

1. **Register/Login**: Create account or login with existing credentials
2. **Create Project**: Click "New Project" to create a chatbot agent
3. **Configure**: Set project name, description, and AI parameters
4. **Chat**: Click on project to open chat interface
5. **Manage**: Edit or delete projects from dashboard

## 🔐 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with expiration (1 hour)
- Input validation on all endpoints
- User data isolation
- Protected routes with authentication middleware
- SQL injection prevention with parameterized queries

## 📊 Performance Considerations

- MongoDB indexing on frequently queried fields
- Pagination on chat history (50 messages limit)
- Token usage tracking for cost monitoring
- Connection pooling for database connections
- Error boundaries in React components

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Production Deployment

### Backend Deployment
```bash
cd backend
npm start
# Ensure environment variables are set in production
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy build/ folder to static hosting service
```

### Environment Setup
- Set `NODE_ENV=production`
- Use production MongoDB instance
- Secure JWT secret (use crypto.randomBytes)
- Enable CORS for production domain
- Use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
- Check MongoDB service is running
- Verify connection string format
- Ensure network access (Atlas: whitelist IP)

**OpenAI API Errors:**
- Verify API key is valid
- Check account has credits
- Monitor rate limits

**JWT Authentication Issues:**
- Ensure JWT_SECRET is set
- Check token expiration
- Verify Authorization header format

**CORS Errors:**
- Backend CORS configured for frontend origin
- Check frontend API base URL

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ using React, Node.js, and OpenAI**