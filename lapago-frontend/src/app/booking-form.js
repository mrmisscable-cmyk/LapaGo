import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Chip, Heading, Panel, Screen } from '../components/Ui';
import { API_URL, apiRequest } from '../constants/api';
import { colors } from '../constants/theme';
import { formatRupiah, venues } from '../constants/venues';

const dates = Array.from({ length: 5 }, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return {
    day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date).toUpperCase(),
    date: String(date.getDate()),
    value: date.toISOString().slice(0, 10),
  };
});
const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '19:00', '20:00', '21:00'];

export default function BookingForm() {
  const router = useRouter();
  const { id, courtId, sport } = useLocalSearchParams();
  const requestedSport = Array.isArray(sport) ? sport[0] : sport;
  const requestedCourtId = Array.isArray(courtId) ? courtId[0] : courtId;
  const venue = venues.find((item) => item.id === id)
    || venues.find((item) => item.sport.toLowerCase() === requestedSport?.toLowerCase())
    || venues[0];
  const [court, setCourt] = useState(null);
  const [courtError, setCourtError] = useState('');
  const [isLoadingCourt, setIsLoadingCourt] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dates[1].value);
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [duration, setDuration] = useState(2);
  const hourlyPrice = court ? Number(court.harga_per_jam) : 0;
  const total = hourlyPrice * duration;

  const continueToPayment = () => {
    if (!court) {
      setCourtError(`Lapangan ${venue.sport} tidak tersedia. Pilih lapangan yang tersedia lalu coba lagi.`);
      return;
    }

    router.push({
      pathname: '/pembayaran',
      params: {
        id: venue.id,
        courtId: String(court.id_lapangan),
        courtName: court.nama_lapangan,
        price: String(hourlyPrice),
        date: selectedDate,
        time: selectedTime,
        duration: String(duration),
      },
    });
  };

  useEffect(() => {
    let isMounted = true;
    apiRequest('/lapangan')
      .then((courts) => {
        if (!Array.isArray(courts)) {
          throw new Error('Format data lapangan dari server tidak sesuai.');
        }
        const availableCourt = courts.find((item) =>
          (!requestedCourtId || String(item.id_lapangan) === requestedCourtId)
          && item.nama_olahraga?.toLowerCase() === venue.sport.toLowerCase()
          && item.status_operasional === 'buka'
          && !item.deleted_at
        );
        if (isMounted) {
          setCourt(availableCourt || null);
          if (!availableCourt) {
            const availableSports = [...new Set(courts.map((item) => item.nama_olahraga).filter(Boolean))];
            setCourtError(
              availableSports.length
                ? `Belum ada lapangan ${venue.sport} di database. Olahraga tersedia: ${availableSports.join(', ')}.`
                : 'Belum ada lapangan yang tersedia di database.'
            );
          }
        }
      })
      .catch((error) => {
        console.error('Gagal memuat lapangan:', error);
        if (isMounted) {
          setCourtError(`${error.message} Pastikan backend aktif dan ponsel terhubung ke Wi-Fi yang sama (${API_URL}).`);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourt(false);
      });

    return () => {
      isMounted = false;
    };
  }, [venue.sport, requestedCourtId]);

  return (
    <Screen>
      <Heading title="Pilih Jadwal" subtitle={court?.nama_lapangan || venue.name} />
      {courtError ? <Text style={styles.error}>{courtError}</Text> : null}
      <View style={styles.stepRow}>
        <Step number="1" label="Jadwal" active />
        <View style={styles.stepLine} />
        <Step number="2" label="Pembayaran" />
        <View style={styles.stepLine} />
        <Step number="3" label="E-Tiket" />
      </View>

      <Panel>
        <Text style={styles.title}>Pilih Tanggal</Text>
        <View style={styles.dates}>
          {dates.map((item) => {
            const active = selectedDate === item.value;
            return (
              <Pressable key={item.value} onPress={() => setSelectedDate(item.value)} style={[styles.date, active && styles.dateActive]}>
                <Text style={[styles.dateDay, active && styles.activeText]}>{item.day}</Text>
                <Text style={[styles.dateNumber, active && styles.activeText]}>{item.date}</Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>

      <Panel>
        <View style={styles.sectionRow}>
          <Text style={styles.title}>Pilih Jam</Text>
          <View style={styles.available}><View style={styles.availableDot} /><Text style={styles.availableText}>7 slot tersedia</Text></View>
        </View>
        <View style={styles.times}>
          {times.map((time) => {
            const unavailable = time === '12:00';
            const active = selectedTime === time;
            return (
              <Chip
                key={time}
                label={unavailable ? `${time} Penuh` : time}
                selected={active}
                onPress={() => !unavailable && setSelectedTime(time)}
              />
            );
          })}
        </View>
      </Panel>

      <Panel>
        <View style={styles.sectionRow}>
          <Text style={styles.title}>Durasi Sewa</Text>
          <Text style={styles.durationPrice}>{court ? `${formatRupiah(hourlyPrice)} / jam` : 'Harga mengikuti database'}</Text>
        </View>
        <View style={styles.durationRow}>
          <Text style={styles.durationLabel}>Jumlah jam</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setDuration(Math.max(1, duration - 1))} style={styles.stepperButton}><Ionicons name="remove" size={18} color={colors.primary} /></Pressable>
            <Text style={styles.durationValue}>{duration} jam</Text>
            <Pressable onPress={() => setDuration(duration + 1)} style={styles.stepperButton}><Ionicons name="add" size={18} color={colors.primary} /></Pressable>
          </View>
        </View>
        <View style={styles.totalRow}><Text style={styles.durationLabel}>Total Pembayaran</Text><Text style={styles.total}>{formatRupiah(total)}</Text></View>
      </Panel>
      <ActionButton
        label="Lanjut ke Pembayaran"
        icon="arrow-forward"
        disabled={isLoadingCourt || !court}
        onPress={continueToPayment}
      />
    </Screen>
  );
}

function Step({ number, label, active = false }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, active && styles.stepNumberActive]}><Text style={[styles.stepNumberText, active && styles.activeText]}>{number}</Text></View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { alignItems: 'center', gap: 6 },
  stepNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.cardHighest, alignItems: 'center', justifyContent: 'center' },
  stepNumberActive: { backgroundColor: colors.primary },
  stepNumberText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  activeText: { color: colors.onPrimary },
  stepLabel: { color: colors.muted, fontSize: 9 },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginHorizontal: 8, marginBottom: 17 },
  title: { color: colors.text, fontSize: 13, fontWeight: '800' },
  dates: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 },
  date: { flex: 1, height: 67, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  dateActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  dateNumber: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  available: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  availableText: { color: colors.primary, fontSize: 9, fontWeight: '700' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationPrice: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  durationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationLabel: { color: colors.muted, fontSize: 11 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  durationValue: { color: colors.text, fontSize: 12, fontWeight: '700' },
  totalRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between' },
  total: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  error: { color: colors.warning, fontSize: 11 },
});
