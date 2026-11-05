🏟️ LapaGo - Venue Booking & Court Management System

LapaGo adalah sistem manajemen dan pemesanan (booking) lapangan olahraga berbasis web dan mobile. Aplikasi ini dirancang untuk mempermudah pengguna dalam memesan lapangan (futsal, badminton, dll.), melakukan pembayaran secara digital (QRIS), serta memberikan kemudahan bagi pengelola dalam memverifikasi pembayaran dan mengelola slot waktu operasional.

🚀 Fitur Utama

👤 Pelanggan (User)

Eksplorasi & Filter Lapangan: Melihat daftar lapangan berdasarkan jenis olahraga (Futsal, Badminton, dll.) dan tipe (indoor / outdoor).

Pemesanan Waktu Nyata (Real-time Slot Booking): Memilih tanggal, jam mulai, dan durasi secara presisi. Slot akan dikunci secara otomatis saat proses pemesanan berlangsung.

Sistem Pembayaran QRIS: Integrasi pembayaran cepat menggunakan kode QRIS.

E-Tiket & Kode QR: Menerbitkan e-tiket otomatis lengkap dengan Kode QR unik untuk verifikasi di lokasi (check-in).

Fitur Favorit: Menyimpan lapangan favorit untuk pemesanan cepat di kemudian hari.

Notifikasi Pengingat: Pengingat jadwal bermain dan status pemesanan.

🛡️ Pengelola / Petugas (Admin & Staff)

Verifikasi Pembayaran: Meninjau dan memverifikasi bukti transfer atau status transaksi QRIS.

Sistem Check-In QR: Memindai (scan) atau memverifikasi Kode QR e-tiket pengunjung di lokasi saat jam pemakaian.

Manajemen Lapangan & Slot: Mengatur jadwal operasional, harga per jam, status lapangan (buka, tutup, pemeliharaan), dan batas waktu pembayaran.

Profil Venue: Pengaturan profil tempat olahraga (nama, alamat, koordinat peta, jam operasional).

🛠️ Teknologi yang Digunakan

Backend & Database: PHP 8.x / Node.js, MySQL / MariaDB (lapago_db)

Password Hashing: bcrypt

Mobile / Push Notification: Expo Push Notification SDK

Database Tools: phpMyAdmin / Workbench

🗄️ Skema Database (lapago_db)

Sistem menggunakan database relasional MySQL dengan struktur sebagai berikut:

users: Menyimpan data akun pelanggan, pengelola, dan vendor.

sport_types: Master data kategori olahraga (Futsal, Badminton, dll.).

courts: Master data lapangan beserta harga, status operasional, dan tipe permukaan.

court_slots: Manajemen slot jam operasional beserta status (tersedia, terkunci, terpesan).

bookings & booking_details: Transaksi pemesanan lapangan dan rincian waktu bermain.

payments: Data transaksi pembayaran QRIS dan verifikasi bukti bayar.

tickets: Generasi e-tiket dan status check-in pengguna.

favorites: Tabel relasi lapangan favorit penggunna.

notifications: Log dan antrean notifikasi pengingat.

venue_profile: Informasi profil venue dan konfigurasi batas waktu kunci slot.

💻 Cara Instalasi & Pengaturan Lokal

1. Prasyarat

XAMPP / WampServer / Laragon (PHP >= 8.2 & MariaDB/MySQL)

Git

2. Clone Repositori

git clone https://github.com/mrmisscable-cmyk/LapaGo.git
cd LapaGo


3. Konfigurasi Database

Buka phpMyAdmin (http://localhost/phpmyadmin).

Buat database baru bernama lapago_db.

Import file lapago_db.sql (atau file SQL dump dari repositori ini) ke dalam database lapago_db.

Sesuaikan kredensial koneksi database pada file konfigurasi aplikasi Anda (misal .env atau config/database.php):

DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=lapago_db


🔒 Hak Akses & Peran Pengguna (Roles)

pelanggan: Pengguna umum yang dapat memesan lapangan, membayar, dan memiliki e-tiket.

pengelola: Petugas/Admin yang memverifikasi pembayaran dan melayani check-in e-tiket di lapangan.

vendor: Pemilik venue yang dapat mengelola informasi tempat dan konfigurasi harga lapangan.

📝 Lisensi

Proyek ini dibuat untuk kebutuhan pengembangan aplikasi pemesanan lapangan olahraga. Terbuka untuk dikembangkan lebih lanjut.
