const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

require('./config/db');

// Import Routes
const penggunaRoutes = require('./routes/penggunaRoutes');
const lapanganRoutes = require('./routes/lapanganRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const pemesananRoutes = require('./routes/pemesananRoutes');

// Gunakan Routes
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/lapangan', lapanganRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/pemesanan', pemesananRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Server LapaGo Backend berjalan lancar!" });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});