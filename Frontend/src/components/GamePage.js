import React from 'react';

export default function GamePage({ userName, scene, onChoice, onSave, onBuyToken, onRewind, onLogout }) {
  if (!scene) return <div>Loading...</div>;

  const { text, image, choices, death, ending } = scene;
  const bg = image ? { backgroundImage:`url(${image})`, backgroundSize:'cover', backgroundPosition:'center' } : {};

  return (
    <div className="w-full max-w-2xl p-4 bg-gray-800 bg-opacity-80 rounded" style={bg}>
      <div className="flex justify-between mb-4">
        <div>Hello, <strong>{userName}</strong>!</div>
        <div>
          <button onClick={onSave} className="px-2 py-1 bg-green-600 rounded mr-2">Save</button>
          <button onClick={onBuyToken} className="px-2 py-1 bg-yellow-600 rounded mr-2">Buy Token</button>
          <button onClick={onLogout} className="px-2 py-1 bg-red-600 rounded">Logout</button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-900 bg-opacity-50 rounded">
        <p className="whitespace-pre-line">{text}</p>
      </div>

      {death ? (
        <div className="text-center">
          <p className="text-red-400 font-bold">You died.</p>
          <button onClick={onRewind} className="mt-3 px-4 py-2 bg-purple-600 rounded">Use Save Point</button>
        </div>
      ) : ending ? (
        <div className="text-center">
          <p className="text-green-400 font-bold">The End. Thanks for playing!</p>
          <button onClick={onLogout} className="mt-3 px-4 py-2 bg-blue-600 rounded">Restart</button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          {choices.map((c,i) => (
            <button key={i} onClick={()=>onChoice(c.next)} className="px-4 py-2 bg-blue-700 rounded text-left">
              {c.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
