# 🚀 TaskForge - Task Management System

A modern, full-stack task management application with user management, real-time updates, and multi-language support.

## ✨ Features

- **👥 User Management**: Create, edit, and manage team members
- **📋 Task Management**: Create, assign, and track tasks
- **🔍 Search & Filters**: Advanced filtering for users and tasks
- **🏢 Department Management**: Organize users by departments
- **💬 Task Comments**: Team collaboration and feedback
- **🌍 Multi-language**: English and French support
- **📱 Responsive Design**: Works on desktop and mobile
- **🔐 Secure Authentication**: JWT-based security

## 🚀 Quick Deploy (5 minutes)

### **Option 1: One-Click Deploy**
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/taskforge)

### **Option 2: Manual Deploy**
1. **Database**: Set up [Neon](https://neon.tech) (free PostgreSQL)
2. **Backend**: Deploy to [Render](https://render.com) (free)
3. **Frontend**: Deploy to [Vercel](https://vercel.com) (free)

📖 **Detailed instructions**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🔑 Default Login

- **Email**: 
- **Password**: 

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/taskforge.git
cd taskforge

# Install dependencies
npm install
cd server && npm install && cd ..

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your database URL

# Start development servers
npm run dev
```

## 📁 Project Structure

```
taskforge/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript types
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Express middleware
│   │   └── routes/        # API routes
│   └── package.json
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── README.md
```

## 🎯 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication
- bcryptjs (password hashing)

**Deployment:**
- Vercel (Frontend)
- Render (Backend)
- Neon (Database)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/comments/task/:id` - Get task comments
- `POST /api/comments/task/:id` - Add comment

## 🌍 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@taskforge.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/taskforge/issues)
- 📖 Docs: [Documentation](https://taskforge-docs.vercel.app)

---

**Made with ❤️ by [Your Name]**
