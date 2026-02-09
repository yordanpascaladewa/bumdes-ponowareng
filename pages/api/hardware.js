import { database } from "../../lib/fire"; // Path naik 2 level
import { ref, get, update } from "firebase/database";

export default async function handler(req, res) {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id, pakan_pagi, pakan_sore } = req.body;

    // 1. UPDATE STATUS (Tandai alat Online & Simpan Jam Terakhir)
    await update(ref(database, 'status_alat'), {
      online: true,
      last_seen: Date.now(),
      laporan_pagi: pakan_pagi,
      laporan_sore: pakan_sore
    });

    // 2. CEK APAKAH ADA PERINTAH DI FIREBASE?
    const perintahRef = ref(database, "perintah");
    const snapshot = await get(perintahRef);
    const data = snapshot.val();

    if (data) {
      // PRIORITY 1: RESET ALAT
      if (data.reset_alat === true) {
        res.status(200).json({ 
          perintah: "RESET", 
          durasi: 0 
        });
        // Matikan trigger reset di database
        await update(perintahRef, { reset_alat: false });
      } 
      // PRIORITY 2: PAKAN MANUAL
      else if (data.beri_pakan_sekarang === true) {
        res.status(200).json({ 
          perintah: "MANUAL", 
          durasi: data.durasi || 10.0 
        });
        // Matikan trigger pakan di database
        await update(perintahRef, { beri_pakan_sekarang: false });
      } 
      // PRIORITY 3: STANDBY (GAK NGAPA-NGAPAIN)
      else {
        res.status(200).json({ perintah: "STANDBY", durasi: 0 });
      }
    } else {
      // Kalau data kosong
      res.status(200).json({ perintah: "STANDBY", durasi: 0 });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}