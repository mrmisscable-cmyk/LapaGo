const db = require('../config/db');

// Mengambil semua data lapangan
const getSemuaLapangan = (req, res) => {
    const query = 'SELECT * FROM lapangan';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error saat mengambil data lapangan:', err);
            return res.status(500).json({ status: 500, pesan: 'Gagal mengambil data lapangan' });
        }
        
        res.status(200).json({
            status: 200,
            pesan: 'Data lapangan berhasil diambil',
            data: results
        });
    });
};

// Menambah lapangan baru
const tambahLapangan = (req, res) => {
    const { nama_lapangan, jenis_lapangan, lokasi, harga_per_jam, status_operasional } = req.body;

    if (!nama_lapangan || !harga_per_jam) {
        return res.status(400).json({
            status: 400,
            pesan: 'Nama lapangan dan harga per jam wajib diisi'
        });
    }

    const query = 'INSERT INTO lapangan (nama_lapangan, jenis_lapangan, lokasi, harga_per_jam, status_operasional) VALUES (?, ?, ?, ?, ?)';
    const values = [nama_lapangan, jenis_lapangan, lokasi, harga_per_jam, status_operasional || 'Buka'];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error saat menambah lapangan:', err);
            return res.status(500).json({ status: 500, pesan: 'Gagal menambah data lapangan' });
        }

        res.status(201).json({
            status: 201,
            pesan: 'Lapangan berhasil ditambahkan',
            data: {
                id_lapangan: results.insertId,
                nama_lapangan,
                jenis_lapangan,
                lokasi,
                harga_per_jam,
                status_operasional: status_operasional || 'Buka'
            }
        });
    });
};

module.exports = {
    getSemuaLapangan,
    tambahLapangan
};