const db = require('../config/db');

// Mengambil jadwal berdasarkan lapangan dan tanggal
const getJadwalByLapangan = (req, res) => {
    const { id_lapangan, tanggal } = req.query;

    if (!id_lapangan) {
        return res.status(400).json({ status: 400, pesan: 'Parameter id_lapangan wajib diisi' });
    }

    let query = 'SELECT * FROM jadwal WHERE id_lapangan = ?';
    let params = [id_lapangan];

    if (tanggal) {
        query += ' AND tanggal = ?';
        params.push(tanggal);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error mengambil jadwal:', err);
            return res.status(500).json({ status: 500, pesan: 'Gagal mengambil jadwal' });
        }
        res.status(200).json({ status: 200, pesan: 'Jadwal berhasil diambil', data: results });
    });
};

// Vendor menambah slot jadwal baru
const tambahJadwal = (req, res) => {
    const { id_lapangan, tanggal, jam_mulai, jam_selesai } = req.body;

    if (!id_lapangan || !tanggal || !jam_mulai || !jam_selesai) {
        return res.status(400).json({ status: 400, pesan: 'Semua field wajib diisi' });
    }

    const query = 'INSERT INTO jadwal (id_lapangan, tanggal, jam_mulai, jam_selesai, status_slot) VALUES (?, ?, ?, ?, ?)';
    const values = [id_lapangan, tanggal, jam_mulai, jam_selesai, 'Tersedia'];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error menambah jadwal:', err);
            return res.status(500).json({ status: 500, pesan: 'Gagal menambah slot jadwal' });
        }
        res.status(201).json({
            status: 201,
            pesan: 'Slot jadwal berhasil ditambahkan',
            data: { id_jadwal: results.insertId, id_lapangan, tanggal, jam_mulai, jam_selesai, status_slot: 'Tersedia' }
        });
    });
};

module.exports = { getJadwalByLapangan, tambahJadwal };