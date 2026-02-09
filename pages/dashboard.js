import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
        // Online jika last_seen < 15 detik yang lalu
        setIsOnline((Date.now() - ts) < 15000); 
      }
    });

    const interval = setInterval(() => {
        if(lastSeen) setIsOnline((Date.now() - lastSeen) < 15000);
    }, 1000);

    return () => { unsubscribe(); clearInterval(interval); };
  }, [lastSeen]);

  // 3. FUNGSI TOMBOL PAKAN MANUAL
  const handleManualFeed = async () => {
    setLoading(true);
    const durasiFix = parseFloat(manualDuration.replace(',', '.'));
    
    if (isNaN(durasiFix) || durasiFix <= 0) {
      alert("Masukkan durasi yang benar!"); 
      setLoading(false); 
      return;
    }

    try {
      await update(ref(database, 'perintah'), { 
        beri_pakan_sekarang: true, 
        durasi: durasiFix 
      });
      alert(`Perintah BUKA ${durasiFix} detik dikirim!`);
    } catch (e) { 
      alert("Gagal koneksi database"); 
    }
    
    setTimeout(() => setLoading(false), 2000);
  };

  // 4. FUNGSI TOMBOL RESET (BARU)
  const handleReset = async () => {
    // Konfirmasi biar gak kepencet
    if(!confirm("Yakin mau RESET alat? Alat akan mundur 30s lalu maju 24.8s untuk kalibrasi ulang.")) return;
    
    setResetLoading(true);
    try {
      await update(ref(database, 'perintah'), { 
        reset_alat: true // Trigger Reset ke ESP32
      });
      alert("Perintah RESET dikirim! Tunggu alat bergerak.");
    } catch (e) { 
      alert("Gagal kirim perintah reset"); 
    }
    setTimeout(() => setResetLoading(false), 3000);
  };

  const handleLogout = () => { 
    localStorage.removeItem('isLoggedIn'); 
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="font-bold text-lg">Smart Feeder 🦆</h1>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest">BUMDES PONOWARENG</p>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-bold text-rose-400 border border-rose-900/50 hover:bg-rose-900/20 px-3 py-1.5 rounded transition">
            LOGOUT
          </button>
        </div>

        {/* STATUS CARD */}
        <div className={`p-8 rounded-2xl text-center border-2 transition-all duration-500 shadow-2xl ${isOnline ? 'bg-emerald-900/20 border-emerald-500/50 shadow-emerald-500/10' : 'bg-rose-900/20 border-rose-500/50 shadow-rose-500/10'}`}>
          <div className="flex justify-center items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <h2 className={`text-3xl font-black ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
              {isOnline ? "ALAT ONLINE" : "ALAT OFFLINE"}
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">
            {isOnline ? "Siap Menerima Perintah" : "Cek Koneksi WiFi Alat!"}
          </p>
        </div>

        {/* KONTROL MANUAL */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <h3 className="text-center font-bold text-slate-400 text-xs mb-6 uppercase tracking-[0.2em]">Kontrol Manual</h3>
          
          {/* INPUT DURASI */}
          <div className="mb-6">
             <div className="relative">
               <input 
                 type="text" 
                 value={manualDuration} 
                 onChange={(e) => setManualDuration(e.target.value)} 
                 className="w-full bg-slate-900 text-center text-5xl font-black py-6 rounded-xl border-2 border-slate-700 focus:border-blue-500 outline-none text-white transition-all placeholder-slate-700"
                 placeholder="0"
               />
               <span className="absolute right-4 bottom-4 text-[10px] font-bold text-slate-600">DETIK</span>
             </div>
          </div>

          {/* TOMBOL BERI MAKAN */}
          <button 
            onClick={handleManualFeed} 
            disabled={loading || !isOnline} 
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest shadow-lg transition-all active:scale-95 uppercase mb-4
              ${loading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : isOnline 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}>
            {loading ? "Sedang Mengirim..." : "Beri Pakan Sekarang"}
          </button>
          
          <div className="border-t border-slate-700 my-4"></div>

          {/* TOMBOL RESET */}
          <button 
            onClick={handleReset} 
            disabled={resetLoading || !isOnline} 
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-widest border border-rose-900/50 text-rose-400 hover:bg-rose-900/20 transition-all uppercase
              ${resetLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
            {resetLoading ? "Memproses..." : "↻ Reset / Kalibrasi Alat"}
          </button>

        </div>

      </div>
    </div>
  );
}