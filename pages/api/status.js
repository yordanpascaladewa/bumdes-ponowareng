import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method === 'GET') {
    try {
      // Ambil data "ALAT_UTAMA" dari MongoDB
      const alat = await Alat.findOne({ id_alat: "ALAT_UTAMA" });
      
      // Kalau database masih kosong (alat belum pernah nyala),
      // Kita kirim data palsu biar website GAK ERROR
      if (!alat) {
        return res.status(200).json({ 
            id_alat: "ALAT_UTAMA",
            last_seen: 0, 
            pakan_pagi: "BELUM", 
            pakan_sore: "BELUM",
            perintah: "STANDBY"
        });
      }
      
      // Kirim data asli
      res.status(200).json(alat);

    } catch (error) {
      console.error("Error Status API:", error);
      res.status(500).json({ error: "Gagal ambil data" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}