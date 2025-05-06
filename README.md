# Interactive Story Game

A full-stack, drop-in prototype of an interactive, text-and-visual adventure built with the MERN stack:
- **M**ongoDB (persistent player data)
- **E**xpress.js (REST API + story engine)
- **R**eact (SPA frontend)
- **N**ode.js (server runtime)

Features:
- User authentication (register / login) with JWT
- Dynamic branching story engine with memory flags and conditional scenarios
- Checkpoint saving and rewind mechanic via “save tokens”
- Simple monetization demo (purchase tokens)
- Dark-themed UI with React + TailwindCSS
- Easy-to-extend story logic in `storyData.js`

---

## 📁 Repository Structure
```
interactive-story-game/
├── backend/             # Express API + MongoDB models
│   ├── models/
│   │   └── User.js      # Mongoose schema for players
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── storyRoutes.js
│   ├── storyData.js     # All story scenes & branching logic
│   ├── server.js        # App setup & route mounting
│   └── .env.example     # Env var template (DB, JWT secret)
└── frontend/            # React SPA with TailwindCSS
    ├── public/          # Static HTML entrypoint
    ├── src/
    │   ├── components/
    │   │   ├── LoginPage.js
    │   │   └── GamePage.js
    │   ├── App.js
    │   └── index.css     # Tailwind directives + custom styles
    ├── tailwind.config.js
    └── package.json     # React & Tailwind dependencies
```

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone <YOUR_REPO_URL>
cd interactive-story-game
```

### 2. Backend Setup
1.  `cd backend`
2.  Copy `.env.example` to `.env` and fill in your values:
    ```env
    MONGODB_URI=<your MongoDB connection string>
    JWT_SECRET=<your JWT signing secret>
    ```
3.  Install dependencies and start the server:
    ```bash
    npm install
    node server.js
    ```
4.  The API will run on http://localhost:5000 by default.

### 3. Frontend Setup
1.  `cd ../frontend`
2.  (Optional) Create a `.env` in `frontend/` to override the API URL:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```
3.  Install dependencies and start the dev server:
    ```bash
    npm install
    npm start
    ```
4.  The app will run on http://localhost:3000.

### 4. Play!
- Register a new user, log in, and enjoy the branching adventure.
- Use **Save** to spend a token and set a checkpoint.
- If you die, click **Use Save Point** to rewind to your last checkpoint.
- Click **Buy Token** to get more save tokens.

---

## ☁️ Deployment Guide

### Backend (e.g. Render.com)
1. Push to GitHub.
2. Create a new **Web Service** on Render, point to `backend/`.
3. Set build & start commands:
   - **Build**: `npm install`
   - **Start**: `node server.js`
4. Add env vars on Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
5. Deploy and note the service URL, e.g. `https://story-backend.onrender.com`.

### Frontend (e.g. Vercel)
1. Create a new **Project** on Vercel, point to `frontend/`.
2. Framework: **Create React App**.
3. Add env var:
   - `REACT_APP_API_URL=https://story-backend.onrender.com`
4. Vercel runs `npm install && npm run build` automatically.
5. Share the Vercel URL, e.g. `https://interactive-story.vercel.app`.

---

## ✏️ Extending the Story
1. Open `backend/storyData.js`.
2. Add or modify scenes in the `storyScenes` object.
3. Use the `choices` array to point to other scene IDs.
4. Optionally include an `action` flag to record player memory:
   ```js
   { text: "Help the merchant", next: "merchant_help", action: "HELP_MERCHANT" }
   ```
5. In `getSceneById`, read `playerMemory` to adjust text & choices dynamically.

---

## 🛠 Troubleshooting
- **CORS errors**: Ensure `cors()` is enabled in `server.js`.
- **Mongo connection**: Double-check `MONGODB_URI` & IP whitelist.
- **JWT issues**: Verify `JWT_SECRET` matches in both routes files.

---

Enjoy building your epic interactive adventure! 🎉

