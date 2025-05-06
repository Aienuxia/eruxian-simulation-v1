import React, { useState } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async e => {
    e.preventDefault();
    const ep = isRegister ? '/api/auth/register' : '/api/auth/login';
    const res = await fetch(API_BASE + ep, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username, password })
    });
    const d = await res.json();
    if (d.error) return alert(d.error);
    onLogin(d.token, d.user.username, d.startingScene);
  };

  return (
    <div className="w-80 p-6 bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={submit} className="flex flex-col space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} className="p-2 rounded bg-gray-700" placeholder="Username" required/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="p-2 rounded bg-gray-700" placeholder="Password" required/>
        <button className="p-2 bg-blue-600 rounded text-white">{isRegister ? "Sign Up" : "Login"}</button>
      </form>
      <p className="mt-4 text-center text-sm">
        {isRegister ? "Have an account?" : "No account?"}{" "}
        <button onClick={()=>setIsRegister(!isRegister)} className="underline text-blue-400">
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
