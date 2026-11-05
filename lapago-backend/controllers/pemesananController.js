const db = require('../config/db');

// Transaksi Booking Baru
const buatPemesanan = (req, res) => {
    const { id_user, id_jadwal, total_harga } = req.body;

    if (!id_user || !id_jadwal || !total_harga) {
        return res.status(400).json({ status: 400, pesan: 'id_user, id_jadwal, dan total_harga wajib diisi' });
    }

    // 1. Cek apakah slot jam masih 'Tersedia'
    db.query('SELECT * FROM jadwal WHERE id_jadwal = ? AND status_slot = "Tersedia"', [id_jadwal], (err, rows) => {
        if (err) return res.status(500).json({ status: 500, pesan: 'Error mengecek slot jadwal' });
        if (rows.length === 0) {
            return res.status(400).json({ status: 400, pesan: 'Slot jam ini sudah tidak tersedia atau telah dipesan' });
        }

        // 2. Buat transaksi Pemesanan
        const insertBookingQuery = 'INSERT INTO pemesanan (id_user, total_harga, status_pembayaran) VALUES (?, ?, ?)';
        db.query(insertBookingQuery, [id_user, total_harga, 'Lunas'], (err, resultBooking) => {
            if (err) return res.status(500).json({ status: 500, pesan: 'Gagal membuat transaksi pemesanan' });

            const id_booking = resultBooking.insertId;

            // 3. Locking Slot Jam (Ubah status_slot menjadi 'Dipesan' dan kaitkan id_booking)
            const updateJadwalQuery = 'UPDATE jadwal SET status_slot = "Dipesan", id_booking = ? WHERE id_jadwal = ?';
            db.query(updateJadwalQuery, [id_booking, id_jadwal], (err) => {
                if (err) console.error('Gagal mengunci jadwal:', err);

                // 4. Terbitkan E-Tiket Digital
                const kode_qr = `QR-LAPAGO-${id_booking}-${Date.now()}`;
                const insertTiketQuery = 'INSERT INTO etiket (id_booking, kode_qr, status_checkin) VALUES (?, ?, ?)';
                
                db.query(insertTiketQuery, [id_booking, kode_qr, 'Belum Check-in'], (err, resultTiket) => {
                    if (err) return res.status(500).json({ status: 500, pesan: 'Gagal menerbitkan e-tiket' });

                    res.status(201).json({
                        status: 201,
                        pesan: 'Pemesanan berhasil! Slot jam telah dikunci dan E-Tiket diterbitkan.',
                        data: {
                            id_booking,
                            id_user,
                            id_jadwal,
                            total_harga,
                            status_pembayaran: 'Lunas',
                            e_tiket: {
                                id_tiket: resultTiket.insertId,
                                kode_qr,
                                status_checkin: 'Belum Check-in'
                            }
                        }
                    });
                });
            });
        });
    });
};

// Mengambil detail pemesanan beserta e-tiket
const getDetailPemesanan = (req, res) => {
    const { id_booking } = req.params;

    const query = `
        SELECT 
            p.id_booking, p.tanggal_booking, p.total_harga, p.status_pembayaran,
            u.nama AS nama_pemesan, u.email, u.no_hp,
            l.nama_lapangan, l.jenis_lapangan, l.lokasi,
            j.tanggal, j.jam_mulai, j.jam_selesai,
            e.kode_qr, e.status_checkin
        FROM pemesanan p
        JOIN pengguna u ON p.id_user = u.id_user
        JOIN jadwal j ON j.id_booking = p.id_booking
        JOIN lapangan l ON j.id_lapangan = l.id_lapangan
        LEFT JOIN etiket e ON e.id_booking = p.id_booking
        WHERE p.id_booking = ?
    `;

    db.query(query, [id_booking], (err, results) => {
        if (err) return res.status(500).json({ status: 500, pesan: 'Gagal mengambil detail pemesanan' });
        if (results.length === 0) return res.status(404).json({ status: 404, pesan: 'Data pemesanan tidak ditemukan' });

        res.status(200).json({ status: 200, data: results[0] });
    });
};

module.exports = { buatPemesanan, getDetailPemesanan };