const db = require('../config/db');

// Fungsi Registrasi
exports.register = (req, res) => {
  // Menerima data dari frontend (React Native)
  const { nama, email, whatsapp, password } = req.body;
  
  // Menetapkan peran default untuk pengguna yang mendaftar via aplikasi
  const peran = 'konsumen'; 

  // 1. Cek apakah email sudah terdaftar
  db.query('SELECT * FROM pengguna WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error server', error: err });
    if (results.length > 0) return res.status(400).json({ message: 'Email sudah terdaftar!' });

    // 2. Masukkan data ke database menyesuaikan nama kolom asli
    // whatsapp -> no_hp | password -> kata_sandi
    const sql = 'INSERT INTO pengguna (nama, email, no_hp, kata_sandi, peran) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [nama, email, whatsapp, password, peran], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ message: 'Gagal mendaftar', error: insertErr });
      res.status(201).json({ message: 'Registrasi berhasil!' });
    });
  });
};

// Fungsi Login
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Sesuaikan kueri pengecekan dengan kolom kata_sandi
  db.query('SELECT * FROM pengguna WHERE email = ? AND kata_sandi = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error server', error: err });
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email atau Password salah!' });
    }

    // Jika berhasil login, kembalikan data user menggunakan id_user
    const user = results[0];
    res.status(200).json({ 
      message: 'Login berhasil', 
      user: { 
        id_user: user.id_user, 
        nama: user.nama, 
        email: user.email,
        peran: user.peran
      }
    });
  });
};