import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();

  // ESP32 Mengirim Data pakai metode POST
  if (req.method === 'POST') {
    try {
      const { pakan_pagi, pakan_sore } = req.body;
      const id_alat = "ALAT_UTAMA";

      // 1. Cari data alat di database
      let alat = await Alat.findOne({ id_alat });
      
      // Kalau belum ada, bikin baru otomatis
      if (!alat) {
        alat = new Alat({ id_alat });
      }

      // 2. Update Status & Waktu Terakhir Dilihat (PENTING BUAT ONLINE/OFFLINE)
      alat.pakan_pagi = pakan_pagi;
      alat.pakan_sore = pakan_sore;
      alat.last_seen = Date.now(); 
      
      // 3. Siapkan Jawaban buat ESP32 (Ada perintah gak?)
      const responseData = {
        perintah: alat.perintah,        // "MANUAL", "RESET", atau "STANDBY"
        durasi: alat.durasi_manual || 0
      };

      // 4. Kalau tadi ada perintah, langsung HAPUS perintahnya (Jadi STANDBY)
      // Supaya ESP32 gak ngejalanin perintah itu terus-terusan
      if (alat.perintah !== "STANDBY") {
        alat.perintah = "STANDBY";
        alat.durasi_manual = 0;
      }
      
      // Simpan perubahan ke MongoDB
      await alat.save();
      
      // Kirim kode 200 (OK) ke ESP32
      res.status(200).json(responseData);

    } catch (error) {
      console.error("Error Hardware API:", error);
      res.status(500).json({ error: "Gagal update database" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}