const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/story', require('./routes/storyRoutes'));

// ——— Remove the static-serve block entirely ———

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
