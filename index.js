// Import Express
import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

//Public klasörünü static serve et
app.use(express.static('public'));

// Geçici veritabanı
const urlDatabase = {};

// Ana route
app.get('/', (req, res) => {
  res.send('URL Shortener projesine hoş geldin! ES6 modülü aktif.');
});

// POST /shorten – Uzun URL'yi kısalt
app.post('/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl gerekli.' });
  }

  // Random shortId oluştur
  const shortId = Math.random().toString(36).substring(2, 8);

  // Expire date (1 gün sonra)
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + 1);

  // Veritabanına kaydet
  urlDatabase[shortId] = {
    longUrl,
    clicks: 0,
    expireAt
  };

  console.log('URL database:', urlDatabase); // Debug log

  res.json({
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    expireAt: expireAt,
    clicks: 0 
  });
});

// GET /:shortId – Redirect ve expire kontrolü
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;

  const entry = urlDatabase[shortId];

  if (!entry) {
    return res.status(404).send('Short URL bulunamadı!');
  }

  const now = new Date();

  if (now > entry.expireAt) {
    return res.status(410).send("Bu short URL'in süresi dolmuştur.");
  }

  entry.clicks += 1; // Click sayısını arttır

  console.log(`ShortId: ${shortId}, Click Count: ${entry.clicks}, Expire Time: ${entry.expireAt}`);

  res.redirect(entry.longUrl);
});

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});