import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Heading, Panel, Screen } from '../components/Ui';
import { colors } from '../constants/theme';
import { venues } from '../constants/venues';

const qrPattern = [
  '11110101111',
  '10010101001',
  '10110111011',
  '10010100001',
  '11110101111',
  '00000101000',
  '11011011101',
  '01001100110',
  '11100110101',
  '10011001011',
  '11101011101',
];

export default function Tiket() {
  const router = useRouter();
  const venue = venues[1];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.text} /></Pressable>
        <Heading title="E-Tiket" subtitle="Tiket masuk lapanganmu" />
      </View>
      <View style={styles.ticketTop}>
        <View style={styles.success}><Ionicons name="checkmark" size={16} color={colors.onPrimary} /></View>
        <Text style={styles.ticketTitle}>Booking Berhasil!</Text>
        <Text style={styles.muted}>Tunjukkan tiket ini kepada petugas arena.</Text>
      </View>
      <Panel style={styles.ticket}>
        <View style={styles.qrFrame}>
          <View style={styles.qrGrid}>
            {qrPattern.flatMap((row, rowIndex) => [...row].map((cell, colIndex) => (
              <View key={`${rowIndex}-${colIndex}`} style={[styles.qrCell, cell === '1' && styles.qrActive]} />
            )))}
          </View>
          <View style={styles.qrCenter}><Ionicons name="flash" size={17} color={colors.primary} /></View>
        </View>
        <Text style={styles.ticketCode}>LP-2025-0841</Text>
        <Text style={styles.qrNote}>PRATINJAU E-TIKET • QR TIDAK DAPAT DIPINDAI</Text>
        <View style={styles.barcode}>
          {Array.from({ length: 34 }, (_, index) => <View key={index} style={[styles.bar, { width: index % 4 === 0 ? 3 : 1, marginRight: index % 3 === 0 ? 2 : 1 }]} />)}
        </View>
        <View style={styles.separator} />
        <Text style={styles.venue}>{venue.name}</Text>
        <Text style={styles.muted}>Lapangan 2 • Badminton</Text>
        <View style={styles.ticketInfo}>
          <View><Text style={styles.label}>TANGGAL</Text><Text style={styles.value}>Sabtu, 25 Okt 2025</Text></View>
          <View><Text style={styles.label}>WAKTU</Text><Text style={styles.value}>14:00 – 16:00 WIB</Text></View>
        </View>
      </Panel>
      <ActionButton label="Kembali ke Beranda" icon="home-outline" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  ticketTop: { alignItems: 'center', gap: 7 },
  success: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  ticketTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 10, textAlign: 'center' },
  ticket: { alignItems: 'center', padding: 20 },
  qrFrame: { width: 178, height: 178, borderRadius: 18, backgroundColor: '#F6F7F9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  qrGrid: { width: 132, height: 132, flexDirection: 'row', flexWrap: 'wrap', padding: 3, backgroundColor: '#FFFFFF' },
  qrCell: { width: '9.09%', height: '9.09%', backgroundColor: '#FFFFFF' },
  qrActive: { backgroundColor: '#121826' },
  qrCenter: { position: 'absolute', width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F6F7F9' },
  ticketCode: { color: colors.text, fontSize: 15, fontWeight: '800', letterSpacing: 1.2, marginTop: 3 },
  qrNote: { color: colors.warning, fontSize: 8, fontWeight: '800', letterSpacing: 0.4, textAlign: 'center' },
  barcode: { flexDirection: 'row', height: 29, alignItems: 'stretch', justifyContent: 'center', overflow: 'hidden', marginTop: 3 },
  bar: { height: '100%', backgroundColor: colors.text },
  separator: { width: '100%', height: 1, backgroundColor: colors.border, marginVertical: 5 },
  venue: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  ticketInfo: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 10, marginTop: 5 },
  label: { color: colors.muted, fontSize: 8, fontWeight: '800', marginBottom: 4 },
  value: { color: colors.text, fontSize: 10, fontWeight: '700' },
});
