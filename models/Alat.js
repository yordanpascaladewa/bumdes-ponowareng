import mongoose from 'mongoose';

const AlatSchema = new mongoose.Schema({
  id_alat: { type: String, required: true, unique: true }, 
  pakan_pagi: { type: String, default: "BELUM" },
  pakan_sore: { type: String, default: "BELUM" },
  last_seen: { type: Number, default: 0 },
  
  // Data Perintah
  perintah: { type: String, default: "STANDBY" }, 
  durasi_manual: { type: Number, default: 0 }
});

// Cek apakah model sudah ada biar gak error overwrite
export default mongoose.models.Alat || mongoose.model('Alat', AlatSchema);