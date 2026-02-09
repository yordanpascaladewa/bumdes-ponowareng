import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // PASSWORD SEMENTARA: admin / bumdes123
    if (username === 'admin' && password === 'bumdes123') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } else {
      setError('Username atau Password Salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 p-3 rounded-2xl mb-3 shadow-lg shadow-blue-500/30">
            🦆
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Smart Feeder Login</h1>
          <p className="text-[10px] text-slate-400 mt-2 tracking-widest uppercase">BUMDES PONOWARENG</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs p-3 rounded-xl mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 p-4 rounded-xl text-white outline-none text-sm font-bold transition-all placeholder-slate-500"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 p-4 rounded-xl text-white outline-none text-sm font-bold transition-all placeholder-slate-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            Masuk Sistem
          </button>
        </form>
      </div>
    </div>
  );
}