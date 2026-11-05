export const venues = [
  {
    id: 'bintang-futsal',
    name: 'GOR Bintang Futsal Centre',
    sport: 'Futsal',
    location: 'Jakarta Selatan',
    address: 'Jl. Cilandak KKO No. 12, Jakarta Selatan',
    price: 85000,
    rating: 4.9,
    reviews: 340,
    distance: '1.4 km',
    courts: 3,
    image: require('../../assets/images/venues/arena-futsal.jpg'),
    facilities: ['Karpet BWF Standard', 'Full AC & Blower', 'Shower & Ruang Ganti'],
  },
  {
    id: 'smash-arena',
    name: 'Grand Smash Arena',
    sport: 'Badminton',
    location: 'Jakarta Selatan',
    address: 'Jl. TB Simatupang No. 8, Jakarta Selatan',
    price: 65000,
    rating: 4.8,
    reviews: 218,
    distance: '2.1 km',
    courts: 6,
    image: require('../../assets/images/venues/arena-badminton.jpg'),
    facilities: ['Karpet BWF Standard', 'Full AC & Blower', 'Kantin Olahraga'],
  },
  {
    id: 'urban-court',
    name: 'Urban Court 360',
    sport: 'Basket',
    location: 'Jakarta Selatan',
    address: 'Jl. Fatmawati Raya No. 20, Jakarta Selatan',
    price: 120000,
    rating: 4.7,
    reviews: 126,
    distance: '3.2 km',
    courts: 2,
    image: require('../../assets/images/venues/arena-basket.jpg'),
    facilities: ['Lapangan indoor', 'Tribun penonton', 'Area parkir'],
  },
  {
    id: 'turf-360',
    name: 'Turf 360',
    sport: 'Futsal',
    location: 'Jakarta Selatan',
    address: 'Jl. Kemang Raya No. 5, Jakarta Selatan',
    price: 95000,
    rating: 4.8,
    reviews: 192,
    distance: '4.0 km',
    courts: 4,
    image: require('../../assets/images/venues/arena-match.jpg'),
    facilities: ['Rumput sintetis', 'Ruang ganti', 'Penyewaan bola'],
  },
];

export function mapCourtToVenue(court) {
  const sport = court.nama_olahraga || 'Olahraga';
  const template = venues.find((venue) => venue.sport.toLowerCase() === sport.toLowerCase()) || venues[0];

  return {
    id: `database-${court.id_lapangan}`,
    courtId: court.id_lapangan,
    name: court.nama_lapangan,
    sport,
    location: court.kategori_lapangan || 'Lapangan',
    address: court.deskripsi || court.nama_lapangan,
    price: Number(court.harga_per_jam),
    image: template.image,
    courts: 1,
  };
}

export const formatRupiah = (amount) =>
  `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
