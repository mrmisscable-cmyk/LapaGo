import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Chip, Heading, IconButton, Screen, SearchBox, VenueCard } from '../../components/Ui';
import { apiRequest } from '../../constants/api';
import { defaultProfile, loadProfile } from '../../constants/profile';
import { colors, radius } from '../../constants/theme';
import { mapCourtToVenue, venues } from '../../constants/venues';

export default function Beranda() {
  const router = useRouter();
  const [courts, setCourts] = useState([]);
  const [sportFilter, setSportFilter] = useState('Semua');
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [courtError, setCourtError] = useState('');
  const [profile, setProfile] = useState(defaultProfile);
  const sports = [
    { title: 'Semua', icon: 'apps-outline' },
    { title: 'Futsal', icon: 'football-outline' },
    { title: 'Badminton', icon: 'fitness-outline' },
    { title: 'Basket', icon: 'basketball-outline' },
  ];

  const loadCourts = useCallback(async (isMounted) => {
    setIsLoadingCourts(true);
    setCourtError('');
    try {
      const result = await apiRequest('/lapangan');
      if (!Array.isArray(result)) throw new Error('Format data lapangan tidak sesuai.');
      if (isMounted()) setCourts(result.filter((court) => court.status_operasional === 'buka' && !court.deleted_at));
    } catch (error) {
      console.error('Gagal memuat lapangan di beranda:', error);
      if (isMounted()) setCourtError(error.message || 'Daftar lapangan tidak dapat dimuat.');
    } finally {
      if (isMounted()) setIsLoadingCourts(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let isMounted = true;
    loadCourts(() => isMounted);
    loadProfile()
      .then((savedProfile) => {
        if (isMounted) setProfile(savedProfile);
      })
      .catch((error) => {
        console.error('Gagal memuat profil untuk beranda:', error);
      });
    return () => {
      isMounted = false;
    };
  }, [loadCourts]));

  const groupedCourts = sports.slice(1)
    .filter((sport) => sportFilter === 'Semua' || sport.title === sportFilter)
    .map((sport) => ({
      ...sport,
      venues: courts
        .filter((court) => court.nama_olahraga?.toLowerCase() === sport.title.toLowerCase())
        .map(mapCourtToVenue),
    }));

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>LAPAGO • SPORTS & ARENA</Text>
          <Text style={styles.title}>Halo, {profile.name} 👋</Text>
          <View style={styles.location}>
            <Ionicons name="location" size={13} color={colors.primary} />
            <Text style={styles.locationText}>Jakarta Selatan</Text>
            <Ionicons name="chevron-down" size={13} color={colors.muted} />
          </View>
        </View>
        <IconButton name="notifications-outline" badge />
      </View>

      <Pressable onPress={() => router.push('/(tabs)/cari')}>
        <SearchBox placeholder="Cari lapangan futsal, badminton..." />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {sports.map((item) => (
          <Chip
            key={item.title}
            label={item.title}
            icon={item.icon}
            selected={sportFilter === item.title}
            onPress={() => setSportFilter(item.title)}
          />
        ))}
      </ScrollView>

      <View style={styles.promo}>
        <View style={styles.promoCopy}>
          <Text style={styles.promoTag}>PROMO SPESIAL</Text>
          <Text style={styles.promoTitle}>Early Bird Discount 20%</Text>
          <Text style={styles.promoBody}>Main slot pagi lebih hemat. Yuk booking sekarang!</Text>
          <Pressable style={styles.promoLink} onPress={() => router.push('/(tabs)/cari')}>
            <Text style={styles.promoLinkText}>Klaim Voucher</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.onPrimary} />
          </Pressable>
        </View>
        <Image source={venues[1].image} style={styles.promoImage} />
      </View>

      <Heading title="Lapangan Berdasarkan Olahraga" subtitle="Nama dan harga sesuai database LapaGo" />
      {courtError ? <Text style={styles.notice}>{courtError}</Text> : null}
      {isLoadingCourts ? <Text style={styles.notice}>Memuat lapangan...</Text> : null}
      {!isLoadingCourts && !courtError ? groupedCourts.map((group) => (
        <View key={group.title} style={styles.sportGroup}>
          <Heading
            title={group.title}
            subtitle={`${group.venues.length} lapangan tersedia`}
            action={group.venues.length ? 'Lihat Semua' : undefined}
            onAction={() => router.push({ pathname: '/(tabs)/cari', params: { sport: group.title } })}
          />
          {group.venues.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.venueList}>
              {group.venues.map((venue) => (
                <VenueCard
                  key={venue.courtId}
                  venue={venue}
                  compact
                  onPress={() => router.push({ pathname: '/arena', params: { courtId: String(venue.courtId) } })}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.notice}>Belum ada lapangan {group.title} di database.</Text>
          )}
        </View>
      )) : null}

      <View style={styles.liveCard}>
        <View style={styles.liveIcon}><Ionicons name="flash" size={18} color={colors.onPrimary} /></View>
        <View style={styles.liveCopy}>
          <Text style={styles.liveTitle}>Ketersediaan lapangan live</Text>
          <Text style={styles.liveText}>Cek jadwal dan booking tanpa antre.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </View>

      <ActionButton label="Jelajahi Semua Arena" icon="search" onPress={() => router.push('/(tabs)/cari')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { flex: 1, gap: 4 },
  eyebrow: { color: colors.primary, fontSize: 9, letterSpacing: 1.4, fontWeight: '800' },
  title: { color: colors.text, fontSize: 21, fontWeight: '800' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: colors.muted, fontSize: 11 },
  categories: { gap: 8, paddingRight: 20 },
  promo: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', minHeight: 160, flexDirection: 'row' },
  promoCopy: { flex: 1, padding: 16, justifyContent: 'center', gap: 7 },
  promoTag: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  promoTitle: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '800' },
  promoBody: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  promoLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 3, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 9, backgroundColor: colors.primary },
  promoLinkText: { color: colors.onPrimary, fontSize: 10, fontWeight: '800' },
  promoImage: { width: 106, height: '100%', opacity: 0.8 },
  venueList: { gap: 12, paddingRight: 20 },
  sportGroup: { gap: 12 },
  notice: { color: colors.muted, fontSize: 11 },
  liveCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  liveIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  liveCopy: { flex: 1, gap: 3 },
  liveTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  liveText: { color: colors.muted, fontSize: 10 },
});