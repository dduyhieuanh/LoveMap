require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isMongoConnected } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const locationRoutes = require('./routes/location.routes');

const app = express();

// Kết nối Database (Tự động dùng MongoDB hoặc Local JSON DB nếu chưa bật MongoDB)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbMode: isMongoConnected() ? 'MongoDB' : 'Local JSON Store',
    message: 'DateSpot API is running!',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DateSpot Backend đang chạy tại http://localhost:${PORT}`);
});
