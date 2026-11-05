import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, Heading, Screen, SearchBox, VenueCard } from '../../components/Ui';
import { apiRequest } from '../../constants/api';
import { colors } from '../../constants/theme';
import { mapCourtToVenue } from '../../constants/venues';

export default function Cari() {
  const router = useRouter();
  const { sport: initialSport } = useLocalSearchParams();
  const selectedSport = Array.isArray(initialSport) ? initialSport[0] : initialSport;
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState(selectedSport || 'Semua');
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const sports = ['Semua', 'Futsal', 'Badminton', 'Basket'];

  const loadCourts = useCallback(async (isMounted) => {
    setIsLoading(true);
    setError('');
    try {
      const courts = await apiRequest('/lapangan');
      if (!Array.isArray(courts)) throw new Error('Format data lapangan tidak sesuai.');
      if (isMounted()) {
        setVenues(courts
          .filter((court) => court.status_operasional === 'buka' && !court.deleted_at)
          .map(mapCourtToVenue));
      }
    } catch (loadError) {
      console.error('Gagal memuat daftar lapangan:', loadError);
      if (isMounted()) setError(loadError.message || 'Daftar lapangan tidak dapat dimuat.');
    } finally {
      if (isMounted()) setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let isMounted = true;
    loadCourts(() => isMounted);
    return () => {
      isMounted = false;
    };
  }, [loadCourts]));

  const results = useMemo(() => venues.filter((venue) => {
    const matchesSport = sport === 'Semua' || venue.sport.toLowerCase() === sport.toLowerCase();
    const matchesQuery = `${venue.name} ${venue.sport} ${venue.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesSport && matchesQuery;
  }), [query, sport, venues]);

  return (
    <Screen>
      <Heading title="Cari Arena" subtitle="Temukan lapangan favoritmu di sekitar sini" />
      <SearchBox value={query} onChangeText={setQuery} placeholder="Cari arena atau lokasi..." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {sports.map((item) => (
          <Chip key={item} label={item} selected={sport === item} onPress={() => setSport(item)} />
        ))}
        <Chip label="Terdekat" icon="navigate-outline" />
        <Chip label="Rating 4+" icon="star-outline" />
      </ScrollView>
      <View style={styles.resultsHeading}>
        <Text style={styles.count}>{results.length} Lapangan</Text>
        <Text style={styles.area}>dari database LapaGo</Text>
      </View>
      {isLoading ? (
        <Text style={styles.emptyText}>Memuat lapangan...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : results.length ? results.map((venue) => (
        <VenueCard key={venue.courtId} venue={venue} onPress={() => router.push({ pathname: '/arena', params: { courtId: String(venue.courtId) } })} />
      )) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Lapangan tidak ditemukan</Text>
          <Text style={styles.emptyText}>Coba kata kunci atau jenis olahraga yang lain.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 8, paddingRight: 20 },
  resultsHeading: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  count: { color: colors.text, fontSize: 14, fontWeight: '800' },
  area: { color: colors.muted, fontSize: 11 },
  empty: { alignItems: 'center', padding: 30, gap: 8 },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  error: { color: colors.warning, fontSize: 12, textAlign: 'center' },
});