import { database } from "../../lib/db";
import { ref, get, update } from "firebase/database";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // PERBAIKAN: Hapus variabel 'id' karena tidak dipake (Biar Vercel gak marah)
    const { pakan_pagi, pakan_sore } = req.body;

    await update(ref(database, 'status_alat'), {
      online: true,
      last_seen: Date.now(),
      laporan_pagi: pakan_pagi,
      laporan_sore: pakan_sore
    });

    const perintahRef = ref(database, "perintah");
    const snapshot = await get(perintahRef);
    const data = snapshot.val();

    if (data) {
      if (data.reset_alat === true) {
        res.status(200).json({ perintah: "RESET", durasi: 0 });
        await update(perintahRef, { reset_alat: false });
      } 
      else if (data.beri_pakan_sekarang === true) {
        res.status(200).json({ 
          perintah: "MANUAL", 
          durasi: data.durasi || 10.0 
        });
        await update(perintahRef, { beri_pakan_sekarang: false });
      } 
      else {
        res.status(200).json({ perintah: "STANDBY", durasi: 0 });
      }
    } else {
      res.status(200).json({ perintah: "STANDBY", durasi: 0 });
    }

  } catch (error) {
    // PERBAIKAN: Console error biar variabel 'error' kepake
    console.error("Firebase Error:", error);
    res.status(500).json({ error: "Database error" });
  }
}