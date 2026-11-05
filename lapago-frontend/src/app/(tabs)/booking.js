import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Heading, Panel, Screen } from '../../components/Ui';
import { apiRequest } from '../../constants/api';
import { colors, radius } from '../../constants/theme';
import { formatRupiah, venues } from '../../constants/venues';

const activeStatuses = ['menunggu_bayar', 'menunggu_verifikasi', 'dikonfirmasi'];

const statusLabels = {
  menunggu_bayar: 'MENUNGGU PEMBAYARAN',
  menunggu_verifikasi: 'MENUNGGU VERIFIKASI',
  dikonfirmasi: 'DIKONFIRMASI',
  selesai: 'SELESAI',
  dibatalkan: 'DIBATALKAN',
  kedaluwarsa: 'KEDALUWARSA',
};

export default function Booking() {
  const [status, setStatus] = useState('Aktif');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tabs = ['Aktif', 'Selesai', 'Dibatalkan'];

  const loadBookings = useCallback(async (shouldUpdate = () => true) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await apiRequest('/bookings');
      if (shouldUpdate()) setBookings(result);
    } catch (loadError) {
      console.error('Gagal memuat booking:', loadError);
      if (shouldUpdate()) setError(loadError.message || 'Riwayat booking tidak dapat dimuat.');
    } finally {
      if (shouldUpdate()) setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let isMounted = true;
    loadBookings(() => isMounted);
    return () => {
      isMounted = false;
    };
  }, [loadBookings]));

  const filteredBookings = bookings.filter((booking) => {
    if (status === 'Aktif') return activeStatuses.includes(booking.status_booking);
    if (status === 'Selesai') return booking.status_booking === 'selesai';
    return ['dibatalkan', 'kedaluwarsa'].includes(booking.status_booking);
  });

  return (
    <Screen>
      <Heading title="Riwayat Pesanan Saya" subtitle="Kelola jadwal tanding dan akses tiket masuk lapangan" />
      <View style={styles.tabs}>
        {tabs.map((tab) => <Chip key={tab} label={tab} selected={status === tab} onPress={() => setStatus(tab)} />)}
      </View>
      {isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.detail}>Memuat booking...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => loadBookings()}>
            <Text style={styles.retry}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : filteredBookings.length ? (
        filteredBookings.map((booking) => {
          const venue = venues.find((item) => item.sport.toLowerCase() === booking.nama_olahraga.toLowerCase()) || venues[0];
          const date = new Date(`${booking.tanggal_main}T12:00:00`);
          return (
            <Panel key={booking.id_booking} style={styles.bookingPanel}>
              <View style={styles.bookingTop}>
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{statusLabels[booking.status_booking] || booking.status_booking}</Text>
                </View>
                <Text style={styles.bookingCode}>#{booking.kode_booking}</Text>
              </View>
              <ImageBackground source={venue.image} style={styles.bookingImage} imageStyle={styles.bookingImageRadius}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{date.getDate()}</Text>
                  <Text style={styles.dateMonth}>{new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date).toUpperCase()}</Text>
                </View>
              </ImageBackground>
              <View style={styles.bookingInfo}>
                <Text style={styles.venueName}>{booking.nama_lapangan}</Text>
                <Text style={styles.detail}>{booking.nama_olahraga}</Text>
                <Text style={styles.detail}>{date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                <Text style={styles.detail}>{booking.jam_mulai} – {booking.jam_selesai} WIB • {booking.durasi_jam} jam</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceLine}>
                <Text style={styles.detail}>Total Pembayaran</Text>
                <Text style={styles.total}>{formatRupiah(Number(booking.total_harga))}</Text>
              </View>
            </Panel>
          );
        })
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Belum ada pesanan {status.toLowerCase()}</Text>
          <Text style={styles.detail}>Pesananmu akan muncul di sini.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
  bookingPanel: { padding: 12, gap: 13 },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning },
  statusText: { color: colors.warning, fontSize: 9, fontWeight: '800' },
  bookingCode: { color: colors.muted, fontSize: 9 },
  bookingImage: { height: 142, justifyContent: 'flex-start', alignItems: 'flex-end' },
  bookingImageRadius: { borderRadius: radius.md },
  dateBadge: { margin: 9, width: 43, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.surface },
  dateDay: { color: colors.text, fontSize: 17, fontWeight: '800' },
  dateMonth: { color: colors.primary, fontSize: 9, fontWeight: '800' },
  bookingInfo: { gap: 7 },
  venueName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 11 },
  divider: { height: 1, backgroundColor: colors.border },
  priceLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  error: { color: colors.warning, fontSize: 12, textAlign: 'center' },
  retry: { color: colors.primary, fontSize: 12, fontWeight: '800' },
});
