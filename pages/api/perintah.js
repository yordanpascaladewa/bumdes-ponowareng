import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method === 'POST') {
    try {
      const { perintah, durasi } = req.body;
      
      // Cari "ALAT_UTAMA" dan update kolom perintahnya
      // Opsi "upsert: true" artinya kalau gak ada datanya, dia bakal bikin baru
      await Alat.findOneAndUpdate(
        { id_alat: "ALAT_UTAMA" },
        { 
            perintah: perintah, 
            durasi_manual: durasi,
            // Kita gak update last_seen disini, biar ketahuan kalau alat mati
        },
        { upsert: true, new: true }
      );
      
      res.status(200).json({ success: true, message: "Perintah terkirim" });

    } catch (error) {
      console.error("Error Perintah API:", error);
      res.status(500).json({ error: "Gagal kirim perintah" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}