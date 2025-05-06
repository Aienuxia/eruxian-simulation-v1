const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interactive-story',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("🗄️  MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Models & Routes
const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/story', storyRoutes);

// In production, serve the React build:
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'))
  );
}

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
