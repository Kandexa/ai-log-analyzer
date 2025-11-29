// server/config/db.js

const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error('❌ MONGO_URI .env dosyasında bulunamadı!');
      process.exit(1);
    }

    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
