import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulasi loading sebentar biar keren
    setTimeout(() => {
        // PASSWORD SEMENTARA: admin / bumdes123
        if (username === 'admin' && password === 'bumdes123') {
          localStorage.setItem('isLoggedIn', 'true');
          router.push('/dashboard');
        } else {
          setError('Username atau Password Salah!');
          setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Login Smart Feeder - KKN Undip</title>
        <meta name="theme-color" content="#0f172a" />
      </Head>
      {/* Background dengan Gradient Halus */}
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] flex flex-col items-center justify-center p-6 font-sans antialiased relative overflow-hidden">
        
        {/* Efek Bulatan Cahaya di Background */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-sm relative z-10">
          {/* Kartu Login Kaca */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl shadow-black/20">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-blue-500/25 animate-bounce-slow">
                <span className="text-3xl">🦆</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Smart Feeder
              </h1>
              <p className="text-xs font-bold text-blue-400 mt-2 tracking-[0.2em] uppercase">
                BUMDES PONOWARENG
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-4 rounded-xl mb-6 text-center animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group">
                <input 
                  type="text" 
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 focus:border-blue-500/80 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/20 p-4 rounded-xl text-white outline-none text-sm font-bold transition-all placeholder-slate-500 group-hover:border-slate-600"
                />
              </div>
              <div className="group">
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 focus:border-blue-500/80 focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/20 p-4 rounded-xl text-white outline-none text-sm font-bold transition-all placeholder-slate-500 group-hover:border-slate-600"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all 
                  ${isLoading ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 active:scale-[0.98]'}
                `}
              >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Masuk...
                    </span>
                ) : "Masuk Sistem"}
              </button>
            </form>
          </div>

          {/* WATERMARK KKN */}
          <div className="mt-12 pt-8 border-t border-slate-800/50 text-center relative z-10">
             <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase leading-relaxed">
               Created with 💙 by
             </p>
             <p className="text-[11px] text-slate-400 font-black tracking-widest uppercase mt-2 bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">
               TIM 1 KKN KELOMPOK 7 Desa Ponowareng
             </p>
             <p className="text-[10px] text-blue-600/60 font-bold tracking-[0.2em] uppercase mt-1.5">
               Universitas Diponegoro 2026
             </p>
          </div>

        </div>
      </div>
    </>
  );
}