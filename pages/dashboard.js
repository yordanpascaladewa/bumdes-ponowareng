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

  // Cek Login
  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/');
  }, []);

  // POLLING DATA (Ganti Realtime Firebase)
  // Dashboard nanya ke database setiap 2 detik
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data) {
          setDataAlat(data);
          // Online jika update terakhir kurang dari 20 detik lalu
          const lastSeen = data.last_seen || 0;
          setIsOnline((Date.now() - lastSeen) < 20000);
        }
      } catch (e) { console.error("Gagal ambil data"); }
    };

    const interval = setInterval(fetchData, 2000);
    fetchData(); // Jalanin sekali pas awal load
    return () => clearInterval(interval);
  }, []);

  // LOGIKA TOMBOL MANUAL & RESET
  const kirimPerintah = async (jenisPerintah, durasi = 0) => {
    if (!isOnline) return alert("Alat sedang OFFLINE!");
    
    if (jenisPerintah === "MANUAL") setLoading(true);
    if (jenisPerintah === "RESET") {
        if(!confirm("⚠️ Reset Alat?")) return;
        setResetLoading(true);
    }

    try {
      await fetch('/api/perintah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perintah: jenisPerintah, durasi: parseFloat(durasi) })
      });
    } catch (e) { alert("Gagal kirim perintah"); }

    setTimeout(() => {
        setLoading(false);
        setResetLoading(false);
    }, 3000);
  };

  // --- BAGIAN TAMPILAN (UI) ---
  // (Bagian bawah ini sama persis kayak yg lama, cuma beda cara ambil variabel dataAlat)
  
  return (
    <>
    <Head><title>Dashboard MongoDB</title></Head>
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <h1 className="font-bold text-lg">🦆 Dashboard Admin</h1>
          <button onClick={() => { localStorage.removeItem('isLoggedIn'); router.push('/'); }} className="text-red-400 text-sm font-bold">LOGOUT</button>
        </div>

        {/* STATUS CARD */}
        <div className={`p-6 rounded-3xl text-center border-2 transition-all shadow-2xl
          ${isOnline ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-rose-500/10 border-rose-500/50'}`}>
          <h2 className={`text-3xl font-black ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Last update: {dataAlat?.last_seen ? new Date(dataAlat.last_seen).toLocaleTimeString() : "-"}
          </p>
        </div>

        {/* JADWAL INFO */}
        <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${dataAlat?.pakan_pagi === 'SUDAH' ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800 border-slate-700'}`}>
                <p className="text-xs text-slate-400">PAKAN PAGI (09:00)</p>
                <p className="text-xl font-bold">{dataAlat?.pakan_pagi || "BELUM"}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${dataAlat?.pakan_sore === 'SUDAH' ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
                <p className="text-xs text-slate-400">PAKAN SORE (15:00)</p>
                <p className="text-xl font-bold">{dataAlat?.pakan_sore || "BELUM"}</p>
            </div>
        </div>

        {/* KONTROL */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
           <input type="number" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} 
             className="w-full bg-slate-900 text-center text-4xl font-black py-4 rounded-xl border border-slate-600 mb-4 text-white" />
           
           <button onClick={() => kirimPerintah("MANUAL", manualDuration)} disabled={loading || !isOnline}
             className={`w-full py-4 rounded-xl font-black mb-3 ${loading ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
             {loading ? "MENGIRIM..." : "BERI PAKAN SEKARANG"}
           </button>

           <button onClick={() => kirimPerintah("RESET")} disabled={resetLoading || !isOnline}
             className="w-full py-3 rounded-xl font-bold border border-slate-600 text-slate-400 hover:bg-slate-700">
             {resetLoading ? "RESETING..." : "RESET / KALIBRASI ALAT"}
           </button>
        </div>

      </div>
    </div>
    </>
  );
}