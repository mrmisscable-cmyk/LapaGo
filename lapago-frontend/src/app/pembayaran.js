import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Heading, Panel, Screen } from '../components/Ui';
import { apiRequest } from '../constants/api';
import { colors } from '../constants/theme';
import { formatRupiah, venues } from '../constants/venues';

export default function Pembayaran() {
  const router = useRouter();
  const { id, courtId, courtName, price, date = '25', time = '14:00', duration = '2' } = useLocalSearchParams();
  const venue = venues.find((item) => item.id === id) || venues[0];
  const dateValue = Array.isArray(date) ? date[0] : date;
  const startTime = Array.isArray(time) ? time[0] : time;
  const durationValue = Array.isArray(duration) ? duration[0] : duration;
  const actualPrice = Number(Array.isArray(price) ? price[0] : price) || venue.price;
  const actualCourtId = Number(Array.isArray(courtId) ? courtId[0] : courtId);
  const actualCourtName = Array.isArray(courtName) ? courtName[0] : courtName;
  const total = actualPrice * Number(durationValue);
  const [isSaving, setIsSaving] = useState(false);

  const saveBooking = async () => {
    setIsSaving(true);
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          courtId: actualCourtId,
          sport: venue.sport,
          date: dateValue,
          time: startTime,
          duration: Number(durationValue),
        }),
      });
      router.replace('/(tabs)/booking');
    } catch (error) {
      console.error('Gagal menyimpan booking:', error);
      Alert.alert('Booking gagal', error.message || 'Booking tidak dapat disimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <Heading title="Pembayaran" subtitle="Selesaikan pembayaran untuk mengamankan jadwalmu" />
      <View style={styles.stepRow}>
        <Step label="Jadwal" done />
        <View style={styles.stepLine} />
        <Step label="Pembayaran" active />
        <View style={styles.stepLine} />
        <Step label="E-Tiket" />
      </View>
      <Panel>
        <Text style={styles.sectionTitle}>RINGKASAN PESANAN</Text>
        <Text style={styles.venue}>{actualCourtName || venue.name}</Text>
        <Text style={styles.muted}>{venue.sport}</Text>
        <View style={styles.orderRow}><Text style={styles.muted}>Tanggal</Text><Text style={styles.value}>{new Date(`${dateValue}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
        <View style={styles.orderRow}><Text style={styles.muted}>Jam</Text><Text style={styles.value}>{startTime} WIB • {durationValue} jam</Text></View>
        <View style={styles.orderRow}><Text style={styles.muted}>Harga sewa</Text><Text style={styles.value}>{formatRupiah(total)}</Text></View>
        <View style={styles.separator} />
        <View style={styles.orderRow}><Text style={styles.totalLabel}>Total Pembayaran</Text><Text style={styles.total}>{formatRupiah(total)}</Text></View>
      </Panel>
      <Panel>
        <View style={styles.bankHeading}>
          <View style={styles.bankIcon}><Ionicons name="business-outline" size={18} color={colors.primary} /></View>
          <View style={styles.bankCopy}><Text style={styles.sectionTitle}>Transfer Bank Manual</Text><Text style={styles.muted}>Upload bukti transfer setelah pembayaran</Text></View>
        </View>
        <View style={styles.account}>
          <Text style={styles.muted}>BANK TUJUAN • BCA</Text>
          <Text style={styles.accountNumber}>8830 1928 811</Text>
          <Text style={styles.value}>a/n PT LapaGo Indonesia</Text>
        </View>
        <View style={styles.warning}>
          <Ionicons name="information-circle" size={16} color={colors.warning} />
          <Text style={styles.warningText}>Pastikan nominal transfer sesuai persis hingga 3 digit terakhir.</Text>
        </View>
      </Panel>
      <ActionButton
        label={isSaving ? 'Menyimpan booking...' : 'Simpan Booking'}
        icon="checkmark-circle-outline"
        disabled={isSaving}
        onPress={saveBooking}
      />
      <Text style={styles.disclaimer}>Booking disimpan sebagai menunggu pembayaran. Pembayaran belum diproses.</Text>
    </Screen>
  );
}

function Step({ label, active = false, done = false }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, (active || done) && styles.stepActive]}>
        <Ionicons name={done ? 'checkmark' : active ? 'ellipse' : 'ellipse-outline'} size={12} color={active || done ? colors.onPrimary : colors.muted} />
      </View>
      <Text style={[styles.stepLabel, active && styles.activeLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { alignItems: 'center', gap: 6 },
  stepNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.cardHighest, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: colors.primary },
  stepLabel: { color: colors.muted, fontSize: 9 },
  activeLabel: { color: colors.primary, fontWeight: '700' },
  stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginHorizontal: 8, marginBottom: 17 },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  venue: { color: colors.text, fontSize: 15, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 10 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  value: { color: colors.text, fontSize: 11, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border },
  totalLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  total: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  bankHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  bankIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  bankCopy: { flex: 1, gap: 4 },
  account: { padding: 14, borderRadius: 12, backgroundColor: colors.surface, gap: 6 },
  accountNumber: { color: colors.text, fontSize: 20, letterSpacing: 1.4, fontWeight: '800' },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  warningText: { flex: 1, color: colors.warning, fontSize: 10, lineHeight: 15 },
  disclaimer: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: -10 },
});
