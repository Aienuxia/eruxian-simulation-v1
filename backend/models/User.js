const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  currentScenario: { type: String, default: null },
  memory: { type: [String], default: [] },
  checkpointScenario: { type: String, default: null },
  checkpointMemory: { type: [String], default: [] },
  tokens: { type: Number, default: 3 }
});

module.exports = mongoose.model('User', UserSchema);