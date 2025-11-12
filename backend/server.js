const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: Flexible for all your frontend environments
const allowedOrigins = [
  'http://localhost:5173',
  'https://credit-card-risk-analysis-mern-hndruipsc.vercel.app',
  'https://credit-card-risk-analysis-mern-ml.vercel.app',
  // Add ANY new Vercel domain here as you see it from deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without 'origin' (like Postman, Curl, SSR)
      if (!origin) return callback(null, true);
      // Allow if the origin is in the whitelist
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        // CORS error for disallowed origins
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Credit Card Default Prediction API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
