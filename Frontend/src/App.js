/*** frontend/src/App.js ***/
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import GamePage from './components/GamePage';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentScene, setCurrentScene] = useState(null);

  // On load, restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedName = localStorage.getItem('userName');
    if (savedToken && savedName) {
      setToken(savedToken);
      setUserName(savedName);
      fetch(`${API_BASE}/api/story/current`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.scenario) setCurrentScene(data.scenario);
        })
        .catch(console.error);
    }
  }, []);

  const handleLogin = (newToken, name, startScene) => {
    setToken(newToken);
    setUserName(name);
    setCurrentScene(startScene);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setToken(null);
    setUserName('');
    setCurrentScene(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
  };

  // <-- TWEAKED: accept action flag -->
  const handleChoice = (nextSceneId, action) => {
    fetch(`${API_BASE}/api/story/choice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nextSceneId, action })
    })
      .then(res => res.json())
      .then(data => {
        if (data.scenario) setCurrentScene(data.scenario);
      })
      .catch(err => console.error('Error advancing story:', err));
  };

  const handleSave = () => {
    fetch(`${API_BASE}/api/story/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) alert('Game saved!');
        else alert(data.error);
      })
      .catch(console.error);
  };

  const handleBuyToken = () => {
    fetch(`${API_BASE}/api/story/buy-token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => alert(`You now have ${data.tokens} token(s).`))
      .catch(console.error);
  };

  const handleRewind = () => {
    fetch(`${API_BASE}/api/story/rewind`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.scenario) setCurrentScene(data.scenario);
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      {!token ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <GamePage
          userName={userName}
          scene={currentScene}
          onChoice={handleChoice}     // now passes action too
          onSave={handleSave}
          onBuyToken={handleBuyToken}
          onRewind={handleRewind}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
