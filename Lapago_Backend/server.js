const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const db = require('./db');
const sessionSecretPath = path.join(__dirname, '.auth-secret');
let sessionSecret = process.env.AUTH_SECRET;
if (!sessionSecret) {
  try {
    sessionSecret = fs.readFileSync(sessionSecretPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    sessionSecret = randomBytes(32);
    fs.writeFileSync(sessionSecretPath, sessionSecret, { flag: 'wx', mode: 0o600 });
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ pesan: 'API LapaGo jalan' }));

function createSession(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id_user,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function requireSession(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Silakan masuk ke akun terlebih dahulu.' });

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ error: 'Sesi tidak valid. Silakan masuk kembali.' });

  const expected = createHmac('sha256', sessionSecret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return res.status(401).json({ error: 'Sesi tidak valid. Silakan masuk kembali.' });
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return res.status(401).json({ error: 'Sesi tidak valid. Silakan masuk kembali.' });
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(session.id) || session.exp <= Date.now()) {
      return res.status(401).json({ error: 'Sesi sudah berakhir. Silakan masuk kembali.' });
    }
    req.userId = session.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesi tidak valid. Silakan masuk kembali.' });
  }
}

function publicProfile(user) {
  return { name: user.nama, email: user.email, phone: user.no_hp };
}

app.post('/auth/register', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const phoneDigits = phone.replace(/\D/g, '');

  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 120 || !/^[0-9+()\-\s]+$/.test(phone) ||
      phoneDigits.length < 8 || phoneDigits.length > 15 || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Nama, email, nomor telepon, atau kata sandi tidak valid. Kata sandi minimal 8 karakter.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      `INSERT INTO users (nama, email, no_hp, kata_sandi, peran)
       VALUES (?, ?, ?, ?, 'pelanggan')`,
      [name, email, phone, passwordHash]
    );
    const user = { id_user: result.insertId, nama: name, email, no_hp: phone };
    res.status(201).json({ token: createSession(user), profile: publicProfile(user) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email atau nomor telepon sudah terdaftar.' });
    }
    console.error('Gagal mendaftarkan akun:', err);
    res.status(500).json({ error: 'Akun tidak dapat dibuat. Silakan coba lagi.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });

  try {
    const [users] = await db.query(
      `SELECT id_user, nama, email, no_hp, kata_sandi, peran
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (!users.length || users[0].peran !== 'pelanggan' || !(await bcrypt.compare(password, users[0].kata_sandi))) {
      return res.status(401).json({ error: 'Email atau kata sandi salah.' });
    }
    res.json({ token: createSession(users[0]), profile: publicProfile(users[0]) });
  } catch (err) {
    console.error('Gagal masuk:', err);
    res.status(500).json({ error: 'Tidak dapat masuk. Silakan coba lagi.' });
  }
});

app.get('/auth/me', requireSession, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT nama, email, no_hp FROM users WHERE id_user = ?',
      [req.userId]
    );
    if (!users.length) return res.status(401).json({ error: 'Akun tidak ditemukan. Silakan masuk kembali.' });
    res.json(publicProfile(users[0]));
  } catch (err) {
    console.error('Gagal memuat akun:', err);
    res.status(500).json({ error: 'Profil tidak dapat dimuat.' });
  }
});

app.patch('/auth/me', requireSession, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const phoneDigits = phone.replace(/\D/g, '');
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 120 || !/^[0-9+()\-\s]+$/.test(phone) ||
      phoneDigits.length < 8 || phoneDigits.length > 15) {
    return res.status(400).json({ error: 'Nama, email, atau nomor telepon tidak valid.' });
  }

  try {
    await db.query('UPDATE users SET nama = ?, email = ?, no_hp = ? WHERE id_user = ?', [
      name, email, phone, req.userId,
    ]);
    res.json({ name, email, phone });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email atau nomor telepon sudah digunakan akun lain.' });
    }
    console.error('Gagal memperbarui profil:', err);
    res.status(500).json({ error: 'Profil tidak dapat diperbarui.' });
  }
});

app.get('/lapangan', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, s.nama_olahraga
       FROM courts c
       JOIN sport_types s ON s.id_olahraga = c.id_olahraga
       WHERE c.deleted_at IS NULL`
    );
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil daftar lapangan:', err);
    res.status(500).json({ error: 'Daftar lapangan tidak dapat dimuat.' });
  }
});

app.get('/bookings', requireSession, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id_booking, b.kode_booking, b.total_harga,
              CASE WHEN b.status_booking = 'menunggu_bayar' AND b.expired_at <= NOW()
                   THEN 'kedaluwarsa' ELSE b.status_booking END AS status_booking,
              b.status_pembayaran, DATE_FORMAT(d.tanggal_main, '%Y-%m-%d') AS tanggal_main,
              TIME_FORMAT(d.jam_mulai, '%H:%i') AS jam_mulai,
              TIME_FORMAT(d.jam_selesai, '%H:%i') AS jam_selesai,
              d.durasi_jam, c.nama_lapangan, s.nama_olahraga
       FROM bookings b
       JOIN users u ON u.id_user = b.id_user
       JOIN booking_details d ON d.id_booking = b.id_booking
       JOIN courts c ON c.id_lapangan = d.id_lapangan
       JOIN sport_types s ON s.id_olahraga = c.id_olahraga
       WHERE b.id_user = ?
       ORDER BY b.tanggal_booking DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil riwayat booking:', err);
    res.status(500).json({ error: 'Riwayat booking tidak dapat dimuat.' });
  }
});

app.post('/bookings', requireSession, async (req, res) => {
  const { courtId, sport, date, time, duration } = req.body;
  const startTime = typeof time === 'string' ? time : '';
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : null;

  if (
    !Number.isInteger(courtId) || courtId < 1 ||
    typeof sport !== 'string' || !sport.trim() ||
    !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date ||
    !/^([01]\d|2[0-3]):00$/.test(startTime) ||
    !Number.isInteger(duration) || duration < 1 || duration > 8
  ) {
    return res.status(400).json({ error: 'Data booking tidak valid.' });
  }

  const start = new Date(`${date}T${startTime}:00`);
  const endHour = Number(startTime.slice(0, 2)) + duration;
  if (start.getTime() <= Date.now() || endHour > 24) {
    return res.status(400).json({ error: 'Pilih jadwal mendatang dengan durasi yang valid.' });
  }
  const endTime = `${String(endHour).padStart(2, '0')}:00`;

  let connection;
  let transactionStarted = false;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [courts] = await connection.query(
      `SELECT c.id_lapangan, c.nama_lapangan, c.harga_per_jam, s.nama_olahraga
       FROM courts c
       JOIN sport_types s ON s.id_olahraga = c.id_olahraga
       WHERE c.id_lapangan = ? AND LOWER(s.nama_olahraga) = LOWER(?)
         AND c.status_operasional = 'buka' AND c.deleted_at IS NULL
       LIMIT 1 FOR UPDATE`,
      [courtId, sport.trim()]
    );
    if (!courts.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({ error: `Lapangan ${sport} yang tersedia tidak ditemukan.` });
    }

    const court = courts[0];
    const [conflicts] = await connection.query(
      `SELECT 1
       FROM booking_details d
       JOIN bookings b ON b.id_booking = d.id_booking
       WHERE d.id_lapangan = ? AND d.tanggal_main = ?
         AND d.jam_mulai < ? AND d.jam_selesai > ?
         AND b.status_booking NOT IN ('dibatalkan', 'kedaluwarsa')
         AND (b.status_booking <> 'menunggu_bayar' OR b.expired_at > NOW())
       LIMIT 1`,
      [court.id_lapangan, date, endTime, startTime]
    );
    const [lockedSlots] = await connection.query(
      `SELECT 1 FROM court_slots
       WHERE id_lapangan = ? AND tanggal = ?
         AND jam_mulai < ? AND jam_selesai > ?
         AND (status_slot = 'terpesan'
              OR (status_slot = 'terkunci' AND locked_until > NOW()))
       LIMIT 1 FOR UPDATE`,
      [court.id_lapangan, date, endTime, startTime]
    );
    if (conflicts.length || lockedSlots.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(409).json({ error: 'Jadwal tersebut sudah dipesan. Silakan pilih jam lain.' });
    }

    const total = Number(court.harga_per_jam) * duration;
    const bookingCode = randomBytes(5).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings
         (kode_booking, id_user, total_harga, status_booking, status_pembayaran, expired_at)
       VALUES (?, ?, ?, 'menunggu_bayar', 'belum_bayar', ?)`,
      [bookingCode, req.userId, total, expiresAt]
    );
    const [detailResult] = await connection.query(
      `INSERT INTO booking_details
         (id_booking, id_lapangan, tanggal_main, jam_mulai, jam_selesai,
          durasi_jam, harga_per_jam, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingResult.insertId, court.id_lapangan, date, startTime, endTime,
        duration, court.harga_per_jam, total]
    );

    for (let hour = Number(startTime.slice(0, 2)); hour < endHour; hour += 1) {
      const slotStart = `${String(hour).padStart(2, '0')}:00`;
      const slotEnd = `${String(hour + 1).padStart(2, '0')}:00`;
      const [updateResult] = await connection.query(
        `UPDATE court_slots
         SET jam_selesai = ?, status_slot = 'terkunci', id_detail = ?, locked_until = ?
         WHERE id_lapangan = ? AND tanggal = ? AND jam_mulai = ?
           AND (status_slot = 'tersedia'
                OR (status_slot = 'terkunci' AND locked_until <= NOW()))`,
        [slotEnd, detailResult.insertId, expiresAt, court.id_lapangan, date, slotStart]
      );
      if (!updateResult.affectedRows) {
        await connection.query(
          `INSERT INTO court_slots
             (id_lapangan, tanggal, jam_mulai, jam_selesai, status_slot, id_detail, locked_until)
           VALUES (?, ?, ?, ?, 'terkunci', ?, ?)`,
          [court.id_lapangan, date, slotStart, slotEnd, detailResult.insertId, expiresAt]
        );
      }
    }

    await connection.commit();
    transactionStarted = false;
    res.status(201).json({
      id_booking: bookingResult.insertId,
      kode_booking: bookingCode,
      total_harga: total,
      status_booking: 'menunggu_bayar',
      tanggal_main: date,
      jam_mulai: startTime,
      jam_selesai: endTime,
      durasi_jam: duration,
      nama_lapangan: court.nama_lapangan,
      nama_olahraga: court.nama_olahraga,
    });
  } catch (err) {
    if (transactionStarted) await connection.rollback();
    console.error('Gagal menyimpan booking:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Akun atau jadwal bertabrakan dengan booking lain. Coba lagi.' });
    }
    res.status(500).json({ error: 'Booking tidak dapat disimpan. Silakan coba lagi.' });
  } finally {
    if (connection) connection.release();
  }
});

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server jalan di port ${process.env.PORT}`);
});
