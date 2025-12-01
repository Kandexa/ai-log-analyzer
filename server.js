console.log('🔥 RUNNING SERVER.JS FILE:', __filename);

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const connectDB = require('./config/db');
const Log = require('./models/Log');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

const upload = multer({ dest: 'uploads/' });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Log Analyzer backend is running 🚀' });
});

function parseLogLine(line) {
  // Example: 2025-11-29 22:10:00 [ERROR] Database connection failed
  const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] (.*)$/;
  const match = line.match(regex);

  if (!match) {
    return {
      timestamp: null,
      level: 'UNKNOWN',
      message: line,
      rawLine: line,
    };
  }

  return {
    timestamp: new Date(match[1]),
    level: match[2],
    message: match[3],
    rawLine: line,
  };
}

app.post('/api/logs/upload', upload.single('logfile'), async (req, res) => {
  console.log('📥 /api/logs/upload CALLED');

  try {
    if (!req.file) {
      console.log('❌ No file received');
      return res
        .status(400)
        .json({ success: false, error: 'No log file provided' });
    }

    const filePath = req.file.path;
    console.log('📄 File path:', filePath);

    let infoCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let totalLines = 0;

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim() === '') continue;

      totalLines++;

      const parsed = parseLogLine(line);

      if (parsed.level === 'INFO') infoCount++;
      else if (parsed.level === 'WARNING') warningCount++;
      else if (parsed.level === 'ERROR') errorCount++;

      await Log.create(parsed);
    }

    console.log('✅ Log file processed:', {
      totalLines,
      infoCount,
      warningCount,
      errorCount,
    });

    return res.json({
      success: true,
      message: 'Log file processed successfully',
      counts: {
        total: totalLines,
        info: infoCount,
        warning: warningCount,
        error: errorCount,
      },
    });
  } catch (err) {
    console.error('💥 Upload error:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Server error (upload)' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const total = await Log.countDocuments();

    const grouped = await Log.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);

    const levelCounts = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      UNKNOWN: 0,
    };

    grouped.forEach((g) => {
      if (levelCounts[g._id] !== undefined) {
        levelCounts[g._id] = g.count;
      }
    });

    res.json({
      success: true,
      total,
      levels: levelCounts,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res
      .status(500)
      .json({ success: false, error: 'Server error (stats)' });
  }
});

app.get('/api/logs-all', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Logs-all error:', err);
    res
      .status(500)
      .json({ success: false, error: 'Server error (logs-all)' });
  }
});

function generateErrorExplanation(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('econnrefused')) {
    return (
      'Bu hata, uygulamanın bağlanmaya çalıştığı servisin (genelde veritabanı) ' +
      'erişilemediğini gösterir. Servis kapalı olabilir, port yanlış olabilir ' +
      'veya firewall bağlantıyı engelliyor olabilir. ' +
      '→ Veritabanı servisinin çalıştığını ve connection string portunun doğru olduğunu kontrol et.'
    );
  }

  if (msg.includes('cannot read property') || msg.includes('of undefined')) {
    return (
      'JavaScript tarafında, beklediğin bir objenin aslında undefined/null olduğunu gösteren tipik bir hatadır. ' +
      'Örneğin user.id kullanıyorsun ama user aslında tanımsız. ' +
      '→ Bu değişkeni kullanmadan önce gerçekten değer alıp almadığını kontrol et ve null check ekle.'
    );
  }

  if (msg.includes('timeout') || msg.includes('took too long')) {
    return (
      'İstek belirtilen süre içinde tamamlanmadığı için zaman aşımına uğramış. ' +
      'Sunucu çok yavaş yanıt veriyor olabilir veya network gecikmesi yaşanıyor olabilir. ' +
      '→ Backend performansını, sorgu sürelerini ve timeout ayarlarını gözden geçir.'
    );
  }

  if (msg.includes('permission') || msg.includes('denied')) {
    return (
      'Bu hata, yetki/izin problemi olduğunu gösterir. Dosya, klasör veya servis için gerekli izinler yok. ' +
      '→ Kullanılan kullanıcının (process user) ilgili kaynağa erişim izni olduğundan emin ol.'
    );
  }

  if (msg.includes('not found') || msg.includes('enoent')) {
    return (
      'İstenen dosya veya resource bulunamamış. Path yanlış olabilir veya dosya gerçekten yok. ' +
      '→ Yolun doğru olduğundan ve dosyanın deploy edilen ortamda gerçekten var olduğundan emin ol.'
    );
  }

  return (
    'Bu hata için özel bir kural bulunamadı. Mesajı inceleyerek; hangi servis, hangi kaynak veya ' +
    'hangi değişkenle ilgili olduğunu tespit et. Genelde: 1) Hatanın geçtiği satırı bul, 2) ' +
    'ilgili değişkenlerin gerçekten değer alıp almadığını kontrol et, 3) Dış servislere yapılan bağlantılarda ' +
    'port, host ve credential bilgilerini doğrula.'
  );
}

app.get('/api/logs/last-error-explain', async (req, res) => {
  try {
    const lastError = await Log.findOne({ level: 'ERROR' })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastError) {
      return res.json({
        success: true,
        hasError: false,
        message: 'Kayıtlı ERROR log bulunamadı.',
      });
    }

    const explanation = generateErrorExplanation(
      lastError.message || lastError.rawLine
    );

    res.json({
      success: true,
      hasError: true,
      errorLog: lastError,
      explanation,
    });
  } catch (err) {
    console.error('Explain error:', err);
    res
      .status(500)
      .json({ success: false, error: 'Server error (explain)' });
  }
});

app.use((req, res) => {
  console.log('⚠️ Unmatched request:', req.method, req.url);
  res.status(404).send('404 - Route not found');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

