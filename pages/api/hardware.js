import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { pakan_pagi, pakan_sore } = req.body;
      const id_alat = "ALAT_UTAMA";

      // Cari alat, kalau gak ada bikin baru (upsert)
      let alat = await Alat.findOne({ id_alat });
      if (!alat) {
        alat = new Alat({ id_alat });
      }

      // Update status dari ESP32
      alat.pakan_pagi = pakan_pagi;
      alat.pakan_sore = pakan_sore;
      alat.last_seen = Date.now();
      
      // Simpan respons perintah buat dikirim balik ke ESP32
      const responseData = {
        perintah: alat.perintah,
        durasi: alat.durasi_manual || 0
      };

      // Kalau tadi ada perintah (MANUAL/RESET), langsung reset jadi STANDBY
      // Supaya ESP32 gak ngejalanin perintah berkali-kali
      if (alat.perintah !== "STANDBY") {
        alat.perintah = "STANDBY";
        alat.durasi_manual = 0;
      }
      
      await alat.save();
      res.status(200).json(responseData);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}