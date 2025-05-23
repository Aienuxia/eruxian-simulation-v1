const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Optional: silence strictQuery deprecation warning
mongoose.set('strictQuery', false);

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/story', require('./routes/storyRoutes'));

// ——— Remove the static-serve block entirely ———

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
