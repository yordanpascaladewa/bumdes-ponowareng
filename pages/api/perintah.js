import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    try {
      const { perintah, durasi } = req.body;
      // Update perintah di database
      await Alat.findOneAndUpdate(
        { id_alat: "ALAT_UTAMA" },
        { perintah: perintah, durasi_manual: durasi },
        { upsert: true }
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Gagal kirim perintah" });
    }
  }
}