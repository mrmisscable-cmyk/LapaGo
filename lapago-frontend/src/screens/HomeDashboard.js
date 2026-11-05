import React from 'react';
import HomeDashboard from './src/screens/HomeDashboard';
import React, { useState, useEffect } from 'react';
// ... import lainnya ...

export default function HomeDashboard({ route }) {
  // 1. Simpan data user dari parameter navigasi (setelah login)
  const userData = route?.params?.user || { nama: 'Pengunjung', email: '' };

  // 2. State untuk menyimpan data dinamis dari backend
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Gunakan useEffect untuk mengambil data saat halaman pertama kali dimuat
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      // Sesuaikan IP address dengan jaringan lokal Anda (misal: 192.168.1.5)
      const response = await fetch('http://<IP_ADDRESS_ANDA>:3000/api/lapangan');
      const data = await response.json();
      setVenues(data); // Simpan data ke dalam state
    } catch (error) {
      console.error("Gagal mengambil data venue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... sisa kode antarmuka Anda ...
}
export default function App() {
  // Nantinya ini bisa diganti dengan NavigationContainer
  return <HomeDashboard />;
}