/*** backend/routes/storyRoutes.js ***/
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const storyData = require('../storyData');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// ─── Auth Middleware ──────────────────────────────────────────────────────────
router.use(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token user' });
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ─── Get Current Scene ───────────────────────────────────────────────────────
router.get('/current', (req, res) => {
  const user = req.user;
  const scene = storyData.getSceneById(
    user.currentScenario || storyData.getStartSceneId(),
    user.memory
  );
  return res.json({ scenario: scene });
});

// ─── Make a Choice ───────────────────────────────────────────────────────────
router.post('/choice', async (req, res) => {
  const user = req.user;
  const { nextSceneId, action } = req.body;
  if (!nextSceneId) {
    return res.json({ error: "No next scene specified" });
  }

  // Record any action flag
  if (action && !user.memory.includes(action)) {
    user.memory.push(action);
  }

  // Advance the scenario
  user.currentScenario = nextSceneId;
  await user.save();

  // Fetch the (possibly dynamic) next scene
  const scene = storyData.getSceneById(nextSceneId, user.memory);
  return res.json({ scenario: scene });
});

// ─── Save a Checkpoint ──────────────────────────────────────────────────────
router.post('/save', async (req, res) => {
  const user = req.user;
  if (user.tokens <= 0) {
    return res.json({ error: "No save tokens available. Purchase one to save progress." });
  }
  user.tokens -= 1;
  user.checkpointScenario = user.currentScenario;
  user.checkpointMemory = [...user.memory];
  await user.save();
  return res.json({ success: true, tokens: user.tokens });
});

// ─── Rewind to Last Checkpoint ──────────────────────────────────────────────
router.post('/rewind', async (req, res) => {
  const user = req.user;
  if (!user.checkpointScenario) {
    return res.json({ error: "No checkpoint set." });
  }
  user.currentScenario = user.checkpointScenario;
  user.memory = [...user.checkpointMemory];
  await user.save();
  const scene = storyData.getSceneById(user.currentScenario, user.memory);
  return res.json({ scenario: scene, tokens: user.tokens });
});

// ─── Buy a Save Token ───────────────────────────────────────────────────────
router.post('/buy-token', async (req, res) => {
  const user = req.user;
  user.tokens += 1;  // free token for demo
  await user.save();
  return res.json({ success: true, tokens: user.tokens });
});

module.exports = router;
