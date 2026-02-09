import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import { database } from "../lib/db"; // Pastikan path ini benar
import { ref, onValue, update } from "firebase/database";

export default function Dashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [manualDuration, setManualDuration] = useState("10"); 
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // 1. CEK LOGIN
  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/');
  }, []);

  // 2. CEK STATUS ALAT (REALTIME)
  useEffect(() => {
    const statusRef = ref(database, 'status_alat/last_seen');
    const unsubscribe = onValue(statusRef, (snap) => {
      const ts = snap.val();
      if (ts) {
        setLastSeen(ts);
        // Online jika last_seen < 20 detik yang lalu (sedikit dilonggarkan)
        setIsOnline((Date.now() - ts) < 20000); 
      }
    });

    const interval = setInterval(() => {
        if(lastSeen) setIsOnline((Date.now() - lastSeen) < 20000);
    }, 2000);

    return () => { unsubscribe(); clearInterval(interval); };
  }, [lastSeen]);

  // FUNGSI TOMBOL PAKAN MANUAL
  const handleManualFeed = async () => {
    if (!isOnline) return alert("Alat sedang OFFLINE! Cek koneksi.");
    setLoading(true);
    const durasiFix = parseFloat(manualDuration.replace(',', '.'));
    
    if (isNaN(durasiFix) || durasiFix <= 0 || durasiFix > 60) {
      alert("Masukkan durasi 1 - 60 detik!"); 
      setLoading(false); 
      return;
    }

    try {
      await update(ref(database, 'perintah'), { 
        beri_pakan_sekarang: true, 
        durasi: durasiFix 
      });
    } catch (e) { 
      alert("Gagal koneksi database"); 
    }
    // Loading visual agak lama biar user tau ada proses
    setTimeout(() => setLoading(false), 3000);
  };

  // FUNGSI TOMBOL RESET
  const handleReset = async () => {
    if (!isOnline) return alert("Alat sedang OFFLINE!");
    if(!confirm("⚠️ PERINGATAN: Reset/Kalibrasi?\n\nAlat akan mundur 30s lalu maju 24.8s untuk mencari posisi awal. Pastikan wadah pakan kosong jika perlu.")) return;
    
    setResetLoading(true);
    try {
      await update(ref(database, 'perintah'), { reset_alat: true });
    } catch (e) { 
      alert("Gagal kirim perintah reset"); 
    }
    setTimeout(() => setResetLoading(false), 5000);
  };

  const handleLogout = () => { 
    localStorage.removeItem('isLoggedIn'); 
    router.push('/'); 
  };

  return (
    <>
    <Head>
      <title>Dashboard Smart Feeder</title>
      <meta name="theme-color" content="#0f172a" />
    </Head>
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f172a] to-[#0f172a] text-white p-4 sm:p-6 font-sans flex flex-col items-center antialiased">
      <div className="w-full max-w-md space-y-5 relative z-10">
        
        {/* HEADER NEW STYLE */}
        <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <span className="text-xl">🦆</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">Dashboard</h1>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">BUMDES Ponowareng</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-700/50 hover:bg-rose-900/30 p-2 rounded-xl transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* STATUS CARD (Lebih Terang) */}
        <div className={`p-6 rounded-[2rem] text-center border-2 transition-all duration-500 shadow-2xl relative overflow-hidden
          ${isOnline 
            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10' 
            : 'bg-rose-500/10 border-rose-500/40 shadow-rose-500/10'}`}>
          
          {/* Background Glow Animation */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-${isOnline ? 'emerald' : 'rose'}-500/30 rounded-full blur-[100px] pointer-events-none`}></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className={`inline-flex mb-3 p-2 rounded-full ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-500'}`}>
                 {isOnline ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                 )}
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${isOnline ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}>
              {isOnline ? "ALAT ONLINE" : "ALAT OFFLINE"}
            </h2>
            <p className="text-[11px] text-slate-300 font-medium mt-2">
              {isOnline ? "Siap Menerima Perintah" : "Cek Koneksi WiFi & Daya Alat!"}
            </p>
          </div>
        </div>

        {/* FITUR BARU: INFO JADWAL OTOMATIS */}
        <div className="bg-slate-800/30 backdrop-blur-md p-5 rounded-[2rem] border border-slate-700/50 shadow-xl">
          <h3 className="text-center font-black text-slate-300 text-xs mb-5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 before:h-px before:w-6 before:bg-slate-700 after:h-px after:w-6 after:bg-slate-700">
            Jadwal Otomatis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Pagi */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-[-20px] top-[-20px] text-6xl opacity-10">☀️</div>
               <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Pakan Pagi</p>
                 <p className="text-2xl font-black text-amber-300 tracking-tight">09:00 <span className="text-xs font-bold">WIB</span></p>
               </div>
            </div>
             {/* Sore */}
             <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-[-20px] top-[-20px] text-6xl opacity-10">🌤️</div>
               <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 relative z-10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider">Pakan Sore</p>
                 <p className="text-2xl font-black text-blue-300 tracking-tight">15:00 <span className="text-xs font-bold">WIB</span></p>
               </div>
            </div>
          </div>
           <p className="text-center text-[10px] text-slate-500 mt-4 italic">
            *Jadwal tersimpan di memori alat (ESP32).
          </p>
        </div>

        {/* KONTROL MANUAL (Glassmorphism) */}
        <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-[2rem] border border-slate-700/50 shadow-xl relative overflow-hidden group">
          
          <h3 className="text-center font-black text-slate-300 text-xs mb-6 uppercase tracking-[0.2em] flex items-center justify-center gap-2 before:h-px before:w-6 before:bg-slate-700 after:h-px after:w-6 after:bg-slate-700">
            Kontrol Manual
          </h3>
          
          {/* INPUT DURASI */}
          <div className="mb-6 relative">
               <input 
                 type="text" 
                 value={manualDuration} 
                 onChange={(e) => setManualDuration(e.target.value)} 
                 className="w-full bg-slate-900/50 text-center text-5xl font-black py-6 rounded-2xl border-2 border-slate-700/50 focus:border-blue-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 outline-none text-white transition-all placeholder-slate-700 relative z-10"
                 placeholder="0"
               />
               <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-end z-20 pointer-events-none opacity-70">
                  <span className="text-[10px] font-black text-blue-500 tracking-widest">DURASI</span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider">DETIK</span>
               </div>
          </div>

          {/* TOMBOL BERI MAKAN */}
          <button 
            onClick={handleManualFeed} 
            disabled={loading || !isOnline} 
            className={`w-full py-4 rounded-xl font-black text-sm tracking-widest shadow-lg transition-all active:scale-[0.98] uppercase mb-4 relative overflow-hidden
              ${loading 
                ? 'bg-slate-700 text-slate-500 cursor-wait' 
                : isOnline 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30' 
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }
            `}>
             <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {loading ? "Sedang Mengirim..." : "Beri Pakan Sekarang"}
             </span>
          </button>
          
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Maintenance</span>
            <div className="h-px bg-slate-700 flex-1"></div>
          </div>

          {/* TOMBOL RESET */}
          <button 
            onClick={handleReset} 
            disabled={resetLoading || !isOnline} 
            className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-widest border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all uppercase flex items-center justify-center gap-2 active:scale-[0.98]
              ${resetLoading ? 'opacity-50 cursor-wait' : (isOnline ? '' : 'opacity-30 cursor-not-allowed')}
            `}>
            {resetLoading ? (
                 <>
                   <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Memproses Reset...</span>
                 </>
            ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Reset / Kalibrasi Alat</span>
                </>
            )}
          </button>

        </div>

        {/* WATERMARK KKN FINAL */}
        <div className="mt-10 pt-6 border-t border-slate-800/50 text-center pb-6">
             <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase leading-relaxed">
               Created with 💙 by
             </p>
             <p className="text-[11px] text-slate-400 font-black tracking-widest uppercase mt-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
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