import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { initUnifiedDatabase } from './config/database-unified.js';

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import analyticsRoutes from './routes/analytics.js';
import parcInformatiqueRoutes from './routes/parc-informatique.js';
import parcInformatiqueSimpleRoutes from './routes/parc-informatique-simple.js';
import parcInformatiqueSimpleNewRoutes from './routes/parc-informatique-simple-new.js';
import parcTelecomRoutes from './routes/parc-telecom.js';
import projetRoutes from './routes/projets.js';
import sousTachesRoutes from './routes/sous-taches.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
app.use(upload.any());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/parc-informatique', parcInformatiqueRoutes);
app.use('/api/parc-informatique-simple', parcInformatiqueSimpleRoutes);
app.use('/api/parc-informatique-simple', parcInformatiqueSimpleNewRoutes);
app.use('/api/parc-telecom', parcTelecomRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/sous-taches', sousTachesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IT Centrale Server Running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initUnifiedDatabase();
    
    app.listen(PORT, () => {
      console.log(`IT Centrale server running on port ${PORT}`);
      console.log(`Default admin: admin@taskforge.com / admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();