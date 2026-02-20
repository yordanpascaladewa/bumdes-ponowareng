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
        const res = await fetch('/api/status'); 
        const data = await res.json();
        if (data) {
          setDataAlat(data);
          const lastSeen = data.last_seen || 0;
          setIsOnline((Date.now() - lastSeen) < 60000); 
        }
      } catch (e) { 
        console.error("Gagal ambil data", e); 
      }
    };

    const interval = setInterval(fetchData, 2000);
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
      <title>Smart Feeder | BUMDes Ponowareng</title>
      <meta name="theme-color" content="#0f172a" />
    </Head>

    {/* BACKGROUND MODERN GLASSMORPHISM */}
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a] text-white p-4 sm:p-6 font-sans flex flex-col items-center antialiased selection:bg-indigo-500/30">
      
      <div className="w-full max-w-md space-y-6 relative z-10 mt-4">
        
        {/* HEADER: Kelihatan lebih premium */}
        <div className="flex justify-between items-center bg-slate-800/40 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg shadow-blue-500/30 border border-blue-400/20">
              <span className="text-2xl drop-shadow-md">🦆</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Smart Feeder</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">BUMDes Ponowareng</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-800/80 hover:bg-rose-500/20 p-3 rounded-2xl transition-all duration-300 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* STATUS CARD: Indikator menyala */}
        <div className={`p-6 rounded-[2rem] text-center border-2 transition-all duration-500 shadow-2xl relative overflow-hidden backdrop-blur-md
          ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20' : 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/20'}`}>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
            <div className={`p-3 rounded-full ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isOnline ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.828 15.172a10 10 0 1112.344 0M8.657 12.343a6 6 0 115.686 0M11.485 9.515a2 2 0 112.828 0" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isOnline ? "SISTEM ONLINE" : "SISTEM OFFLINE"}
            </h2>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] opacity-80">
               {isOnline ? "Alat Siap Menerima Instruksi" : "Menunggu Koneksi ESP32..."}
            </p>
          </div>
        </div>

        {/* JADWAL OTOMATIS: Card terpisah */}
        <div className="bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="font-black text-slate-300 text-xs uppercase tracking-[0.2em]">Jadwal Rutin</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`relative overflow-hidden p-5 rounded-3xl border transition-all ${dataAlat?.pakan_pagi === 'SUDAH' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/5 border-amber-500/50 shadow-lg shadow-amber-500/10' : 'bg-slate-900/50 border-slate-700/50'}`}>
               <span className="text-3xl mb-2 block drop-shadow-md">🌅</span>
               <span className="text-[11px] font-black text-slate-400 tracking-widest block mb-1">PAGI • 06:00</span>
               <span className={`text-sm font-black tracking-widest ${dataAlat?.pakan_pagi === 'SUDAH' ? 'text-amber-400' : 'text-slate-600'}`}>
                 {dataAlat?.pakan_pagi || "BELUM"}
               </span>
            </div>
            
             <div className={`relative overflow-hidden p-5 rounded-3xl border transition-all ${dataAlat?.pakan_sore === 'SUDAH' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/5 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-slate-900/50 border-slate-700/50'}`}>
               <span className="text-3xl mb-2 block drop-shadow-md">🌇</span>
               <span className="text-[11px] font-black text-slate-400 tracking-widest block mb-1">SORE • 16:00</span>
               <span className={`text-sm font-black tracking-widest ${dataAlat?.pakan_sore === 'SUDAH' ? 'text-blue-400' : 'text-slate-600'}`}>
                 {dataAlat?.pakan_sore || "BELUM"}
               </span>
            </div>
          </div>
        </div>

        {/* KONTROL MANUAL: Form lebih elegan */}
        <div className="bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
             <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <h3 className="font-black text-slate-300 text-xs uppercase tracking-[0.2em]">Kendali Manual</h3>
          </div>
          
          <div className="mb-6 relative group">
               <input type="number" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} 
                 className="w-full bg-slate-900/80 text-center text-4xl font-black py-6 rounded-3xl border border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-white transition-all shadow-inner"
               />
               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-indigo-500 tracking-widest pointer-events-none group-focus-within:text-indigo-400 transition-colors">DETIK</span>
          </div>

          <button onClick={() => kirimPerintah("MANUAL", manualDuration)} disabled={loading || !isOnline} 
            className={`w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl transition-all duration-300 mb-4 flex justify-center items-center gap-2
            ${loading ? 'bg-slate-800 text-slate-500 scale-95' : isOnline ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/50'}`}>
              {loading ? (
                <><svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> MEMPROSES...</>
              ) : "Beri Pakan Sekarang"}
          </button>
          
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6 w-full"></div>

          <button onClick={() => kirimPerintah("RESET")} disabled={resetLoading || !isOnline} 
            className={`w-full py-4 rounded-2xl font-bold text-[10px] tracking-widest border transition-all duration-300 uppercase flex justify-center items-center gap-2
            ${resetLoading ? 'border-slate-800 bg-slate-800/50 text-slate-600' : isOnline ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50' : 'border-slate-800 text-slate-700'}`}>
            {resetLoading ? "KALIBRASI BERJALAN..." : "Reset / Kalibrasi Alat"}
          </button>
        </div>

        {/* WATERMARK LINTAS JURUSAN */}
        <div className="mt-8 pt-6 text-center pb-8 space-y-1.5 opacity-60 hover:opacity-100 transition-opacity">
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Built with <span className="text-rose-500 animate-pulse">❤️</span> by</p>
             <p className="text-[11px] text-white font-black uppercase tracking-widest">Tim 1 KKN UNDIP Desa Ponowareng</p>
             <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.4em]">Lintas Jurusan • 2026</p>
        </div>

      </div>
    </div>
    </>
  );
}