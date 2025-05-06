const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const storyData = require('../storyData');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username||!password) return res.json({ error:"Username & password required" });
  if (await User.findOne({ username })) return res.json({ error:"Username taken" });
  const hash = await bcrypt.hash(password, 10);
  const startId = storyData.getStartSceneId();
  const u = await User.create({ username, passwordHash: hash, currentScenario: startId, checkpointScenario: startId });
  const token = jwt.sign({ userId: u._id }, JWT_SECRET, { expiresIn:'2h' });
  return res.json({ token, user:{username:u.username}, startingScene: storyData.getSceneById(startId) });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username||!password) return res.json({ error:"Username & password required" });
  const u = await User.findOne({ username });
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return res.json({ error:"Invalid creds" });
  const token = jwt.sign({ userId: u._id }, JWT_SECRET, { expiresIn:'2h' });
  let scene = storyData.getSceneById(u.currentScenario || storyData.getStartSceneId(), u.memory);
  return res.json({ token, user:{username:u.username}, startingScene: scene });
});

module.exports = router;
