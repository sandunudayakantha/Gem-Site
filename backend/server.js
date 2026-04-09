import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './models/index.js';

// Import Routes
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import sizeRoutes from './routes/sizeRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import contactMessageRoutes from './routes/contactMessageRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://shop.mydomain.com',
      'https://admin.mydomain.com',
      'http://shop.mydomain.com',
      'http://admin.mydomain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth/admin', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/contact-messages', contactMessageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SJ Clothing API is running' });
});

// Sync database and start server
const PORT = process.env.PORT || 5007;

db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('✅ Connected to MySQL and tables synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection error:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Start MySQL locally: brew services start mysql (macOS)');
    console.error('   2. Set DB_* variables in .env file');
    console.error('   3. Check if MySQL is installed and running');
    process.exit(1);
  });

export default app;
