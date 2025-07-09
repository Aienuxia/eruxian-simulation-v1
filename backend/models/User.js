// Simple in-memory user store used when MongoDB is unavailable.
// This mimics the small subset of the Mongoose API used by the routes.

const users = {}; // id -> user object
let nextId = 1;

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    users[this._id] = this;
    return this;
  }

  static async findOne(query) {
    if (!query) return null;
    const key = Object.keys(query)[0];
    const value = query[key];
    const found = Object.values(users).find(u => u[key] === value);
    return found ? new User(found) : null;
  }

  static async create(data) {
    const user = new User({ _id: String(nextId++), ...data });
    await user.save();
    return user;
  }

  static async findById(id) {
    const u = users[id];
    return u ? new User(u) : null;
  }
}

module.exports = User;