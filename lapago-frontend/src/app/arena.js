import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, InfoRow, Panel, Screen } from '../components/Ui';
import { apiRequest } from '../constants/api';
import { colors, radius } from '../constants/theme';
import { formatRupiah, mapCourtToVenue, venues } from '../constants/venues';

export default function ArenaDetail() {
  const router = useRouter();
  const { id, courtId } = useLocalSearchParams();
  const [databaseVenue, setDatabaseVenue] = useState(null);
  const staticVenue = venues.find((item) => item.id === id) || venues[0];
  const venue = databaseVenue || staticVenue;
  const hasDatabaseCourt = Boolean(databaseVenue);

  useEffect(() => {
    if (!courtId) return undefined;
    let isMounted = true;
    apiRequest('/lapangan')
      .then((courts) => {
        const court = courts.find((item) => String(item.id_lapangan) === String(courtId));
        if (isMounted && court) setDatabaseVenue(mapCourtToVenue(court));
      })
      .catch((error) => {
        console.error('Gagal memuat detail lapangan:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [courtId]);

  return (
    <Screen contentStyle={styles.page}>
      <ImageBackground source={venue.image} style={styles.hero} imageStyle={styles.heroImage}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.heroTag}><View style={styles.liveDot} /><Text style={styles.heroTagText}>{hasDatabaseCourt ? venue.location.toUpperCase() : 'LIVE COURT AVAILABILITY 99.8%'}</Text></View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{venue.name}</Text>
          <Text style={styles.heroSubtitle}>{venue.sport} • {venue.location}</Text>
        </View>
      </ImageBackground>

      {hasDatabaseCourt ? null : (
        <View style={styles.rating}>
          <Ionicons name="star" size={15} color={colors.warning} />
          <Text style={styles.ratingText}>{venue.rating} ({venue.reviews} ulasan)</Text>
          <View style={styles.ratingDot} />
          <Text style={styles.ratingText}>{venue.distance}</Text>
        </View>
      )}

      <Panel>
        <View style={styles.priceHead}>
          <Text style={styles.sectionTitle}>TARIF SEWA SLOT</Text>
          <Text style={styles.guarantee}>✓ Harga terbaik</Text>
        </View>
        <Text style={styles.price}>{formatRupiah(venue.price)} <Text style={styles.perHour}>/ jam</Text></Text>
        <Text style={styles.note}>Tarif bervariasi sesuai sesi reguler (pagi-siang) dan prime-time (malam & weekend).</Text>
      </Panel>

      <Panel>
        <InfoRow icon="time-outline" label="BUKA SETIAP HARI" value="06:00 – 24:00 WIB" />
        <InfoRow icon="tennisball-outline" label="LAPANGAN TERSEDIA" value={hasDatabaseCourt ? venue.name : `${venue.courts} Slot Lapangan`} />
      </Panel>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{hasDatabaseCourt ? 'DESKRIPSI LAPANGAN' : 'FASILITAS ARENA'}</Text>
        <View style={styles.facilityGrid}>
          {(hasDatabaseCourt ? [venue.address] : venue.facilities).map((facility) => (
            <View style={styles.facility} key={facility}>
              <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
        </View>
      </View>

      <Panel>
        <InfoRow icon="location-outline" label="ALAMAT ARENA" value={venue.address} />
      </Panel>
      <ActionButton
        label="Pilih Jadwal"
        icon="calendar-outline"
        onPress={() => router.push({
          pathname: '/booking-form',
          params: {
            id: (venues.find((item) => item.sport.toLowerCase() === venue.sport.toLowerCase()) || venues[0]).id,
            courtId: hasDatabaseCourt ? String(venue.courtId) : undefined,
            sport: venue.sport,
          },
        })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 0 },
  hero: { height: 310, justifyContent: 'space-between', marginHorizontal: -20, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  heroImage: { resizeMode: 'cover' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0E1321CC', alignItems: 'center', justifyContent: 'center' },
  heroTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, borderRadius: radius.pill, backgroundColor: '#0E1321CC' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  heroTagText: { color: colors.primary, fontSize: 9, fontWeight: '800' },
  heroCopy: { gap: 5 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: '#E4E6F0', fontSize: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -7 },
  ratingText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  ratingDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.muted, marginHorizontal: 4 },
  priceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  guarantee: { color: colors.primary, fontSize: 9, fontWeight: '700' },
  price: { color: colors.primary, fontSize: 23, fontWeight: '800' },
  perHour: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  note: { color: colors.muted, fontSize: 10, lineHeight: 16 },
  section: { gap: 12 },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facility: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  facilityText: { color: colors.text, fontSize: 10, fontWeight: '600' },
});
