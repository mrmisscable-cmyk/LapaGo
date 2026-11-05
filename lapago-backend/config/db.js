const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi ke database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Mengecek koneksi
db.connect((err) => {
    if (err) {
        console.error('Koneksi database gagal:', err);
    } else {
        console.log('Berhasil terhubung ke database MySQL (lapago_db)');
    }
});

module.exports = db;