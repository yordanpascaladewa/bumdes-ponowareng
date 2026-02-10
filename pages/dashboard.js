import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [dataAlat, setDataAlat] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [manualDuration, setManualDuration] = useState("10");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // 1. Cek Login
  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/');
  }, []);

  // 2. Ambil Data (Polling MongoDB)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status'); // Panggil API Status
        const data = await res.json();
        if (data) {
          setDataAlat(data);
          
          // LOGIKA ONLINE BARU: Toleransi 60 Detik (1 Menit)
          // Biar gak gampang bilang "Offline" kalau internet kedip dikit
          const lastSeen = data.last_seen || 0;
          setIsOnline((Date.now() - lastSeen) < 60000); 
        }
      } catch (e) { 
        console.error("Gagal ambil data", e); 
      }
    };

    const interval = setInterval(fetchData, 2000); // Update tiap 2 detik
    fetchData(); 
    return () => clearInterval(interval);
  }, []);

  // 3. Fungsi Kirim Perintah
  const kirimPerintah = async (jenisPerintah, durasi = 0) => {
    if (!isOnline) return alert("⚠️ Alat sedang OFFLINE / Belum Lapor!");
    
    if (jenisPerintah === "MANUAL") {
        if(durasi < 1 || durasi > 60) return alert("Durasi harus 1-60 detik!");
        setLoading(true);
    }
    if (jenisPerintah === "RESET") {
        if(!confirm("⚠️ Yakin Reset Alat? Alat akan gerak mundur & maju otomatis.")) return;
        setResetLoading(true);
    }

    try {
      await fetch('/api/perintah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perintah: jenisPerintah, durasi: parseFloat(durasi) })
      });
    } catch (e) { 
        alert("Gagal kirim perintah ke server"); 
    }

    // Loading visual sebentar
    setTimeout(() => {
        setLoading(false);
        setResetLoading(false);
    }, 3000);
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
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <span className="text-xl">🦆</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">Dashboard</h1>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">BUMDES Ponowareng</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-700/50 hover:bg-rose-900/30 p-2 rounded-xl transition-colors text-slate-400 hover:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* STATUS CARD */}
        <div className={`p-6 rounded-[2rem] text-center border-2 transition-all duration-500 shadow-2xl relative overflow-hidden
          ${isOnline ? 'bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500/40 shadow-rose-500/10'}`}>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-black tracking-tight ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
              {isOnline ? "ALAT ONLINE" : "ALAT OFFLINE"}
            </h2>
            <p className="text-[10px] text-slate-300 font-medium mt-1 uppercase tracking-widest">
               {isOnline ? "Siap Menerima Perintah" : "Cek Koneksi WiFi & Daya!"}
            </p>
          </div>
        </div>

        {/* JADWAL OTOMATIS */}
        <div className="bg-slate-800/30 backdrop-blur-md p-5 rounded-[2rem] border border-slate-700/50 shadow-xl">
          <h3 className="text-center font-black text-slate-400 text-[10px] mb-4 uppercase tracking-[0.2em]">Jadwal Otomatis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border flex flex-col items-center ${dataAlat?.pakan_pagi === 'SUDAH' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
               <span className="text-2xl mb-1">☀️</span>
               <span className="text-xs font-bold text-slate-400">06:00 WIB</span>
               <span className={`text-sm font-black mt-1 ${dataAlat?.pakan_pagi === 'SUDAH' ? 'text-amber-400' : 'text-slate-500'}`}>
                 {dataAlat?.pakan_pagi || "BELUM"}
               </span>
            </div>
             <div className={`p-4 rounded-2xl border flex flex-col items-center ${dataAlat?.pakan_sore === 'SUDAH' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
               <span className="text-2xl mb-1">☁️</span>
               <span className="text-xs font-bold text-slate-400">16:00 WIB</span>
               <span className={`text-sm font-black mt-1 ${dataAlat?.pakan_sore === 'SUDAH' ? 'text-blue-400' : 'text-slate-500'}`}>
                 {dataAlat?.pakan_sore || "BELUM"}
               </span>
            </div>
          </div>
        </div>

        {/* KONTROL MANUAL */}
        <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
          <h3 className="text-center font-black text-slate-400 text-[10px] mb-6 uppercase tracking-[0.2em]">Kontrol Manual</h3>
          
          <div className="mb-6 relative">
               <input type="number" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} 
                 className="w-full bg-slate-900/50 text-center text-4xl font-black py-5 rounded-2xl border-2 border-slate-700/50 focus:border-blue-500/50 outline-none text-white relative z-10"
               />
               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 tracking-widest z-20 pointer-events-none">DETIK</span>
          </div>

          <button onClick={() => kirimPerintah("MANUAL", manualDuration)} disabled={loading || !isOnline} 
            className={`w-full py-4 rounded-xl font-black text-xs tracking-widest uppercase shadow-lg transition-all mb-4
            ${loading ? 'bg-slate-700 text-slate-500' : isOnline ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
             {loading ? "Sedang Mengirim..." : "Beri Pakan Sekarang"}
          </button>
          
          <div className="h-px bg-slate-700/50 my-4 w-full"></div>

          <button onClick={() => kirimPerintah("RESET")} disabled={resetLoading || !isOnline} 
            className={`w-full py-3 rounded-xl font-bold text-[10px] tracking-widest border transition-all uppercase
            ${resetLoading ? 'border-slate-700 text-slate-500' : isOnline ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' : 'border-slate-800 text-slate-600'}`}>
            {resetLoading ? "Memproses Reset..." : "Reset / Kalibrasi Alat"}
          </button>
        </div>

        {/* WATERMARK */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center pb-4">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Created with 💙 by</p>
             <p className="text-[11px] text-slate-400 font-black uppercase mt-1">TIM 1 KKN KELOMPOK 7 Desa Ponowareng</p>
             <p className="text-[10px] text-blue-600/60 font-bold uppercase mt-1">Universitas Diponegoro 2026</p>
        </div>

      </div>
    </div>
    </>
  );
}