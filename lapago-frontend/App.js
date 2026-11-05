import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ==========================================
// KONFIGURASI API BACKEND
// PENTING: Ganti IP ini dengan IPv4 laptop Anda (cek via CMD -> ipconfig)
// Contoh: 'http://192.168.1.15:3000/api'
// ==========================================
const API_BASE_URL = 'http://20.5.32.191:3000/api';

// ==========================================
// 1. KOMPONEN AUTH SCREEN (LOGIN & REGISTER)
// ==========================================
function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!nama || !whatsapp))) {
      Alert.alert('Error', 'Harap lengkapi semua data!');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/pengguna/login' : '/pengguna/register';
    const payload = isLogin
      ? { email, password }
      : { nama, email, whatsapp, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          Alert.alert('Sukses', 'Berhasil Login!');
          onLoginSuccess(data.user); // Kirim data user ke Dashboard
        } else {
          Alert.alert('Sukses', 'Registrasi Berhasil! Silakan Login.');
          setIsLogin(true); // Pindah ke tampilan login
        }
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      Alert.alert('Koneksi Gagal', 'Pastikan IP backend benar dan server menyala.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authContent}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="strategy" size={48} color="#2ECC71" />
          <Text style={styles.authBrandText}>LapaGo</Text>
          <Text style={styles.authSubtitle}>{isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}</Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Nama Lengkap" placeholderTextColor="#A0AEC0" value={nama} onChangeText={setNama} />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="logo-whatsapp" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Nomor WhatsApp" placeholderTextColor="#A0AEC0" keyboardType="phone-pad" value={whatsapp} onChangeText={setWhatsapp} />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#A0AEC0" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#A0AEC0" secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#0B111A" /> : <Text style={styles.submitBtnText}>{isLogin ? 'Masuk' : 'Daftar Sekarang'}</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>{isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}</Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleTextHighlight}>{isLogin ? 'Daftar' : 'Masuk'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 2. KOMPONEN HOME DASHBOARD (SETELAH LOGIN)
// ==========================================
function HomeDashboard({ user, onLogout }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeTab, setActiveTab] = useState('Explore');
  const [notifEnabled, setNotifEnabled] = useState(true);

  // State untuk data lapangan dari database
  const [venues, setVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);

  const categories = ['Semua', 'Futsal ⚽', 'Badminton 🏸', 'Basket 🏀'];
  const bottomNavItems = [
    { icon: 'compass', label: 'Explore' },
    { icon: 'search', label: 'Search' },
    { icon: 'calendar', label: 'Schedule' },
    { icon: 'person', label: 'Profile' }
  ];

  // Mengambil data lapangan saat masuk ke dashboard
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lapangan`);
      const data = await response.json();

      // Pengaman 1: Jika API merespons dengan array
      if (Array.isArray(data)) {
        setVenues(data);
      }
      // Pengaman 2: Jika API merespons dengan object JSON standar (data.data)
      else if (data && Array.isArray(data.data)) {
        setVenues(data.data);
      }
      // Pengaman 3: Format error, panggil catch block
      else {
        throw new Error("Format data tidak sesuai");
      }
    } catch (error) {
      console.log("Menggunakan data tiruan (dummy) karena API belum tersedia/format salah.");
      // Fallback data agar UI tidak kosong/crash jika backend belum siap
      setVenues([
        { id: 1, nama_lapangan: 'Champions Futsal & Badminton', lokasi: 'Kuningan - 1.2 km', harga_per_jam: 150000, rating: 4.9, ulasan: 180, gambar_url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=600&auto=format&fit=crop' },
        { id: 2, nama_lapangan: 'ProCourt Senayan', lokasi: 'Senayan - 3.4 km', harga_per_jam: 220000, rating: 4.8, ulasan: 95, gambar_url: 'https://images.unsplash.com/photo-1598259021235-901eb869fc48?q=80&w=800&auto=format&fit=crop' }
      ]);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const renderExploreScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="strategy" size={24} color="#2ECC71" />
            <Text style={styles.brandText}>LapaGo</Text>
          </View>
          <Text style={styles.greeting}>Halo, {user?.nama?.split(' ')[0] || 'Pengguna'} 👋</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#2ECC71" />
            <Text style={styles.locationText}>Jakarta Selatan</Text>
            <Ionicons name="chevron-down" size={14} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}><Ionicons name="notifications-outline" size={20} color="#E2E8F0" /></TouchableOpacity>
          <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} style={styles.profilePic} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Cari lapangan futsal, badminton..." placeholderTextColor="#A0AEC0" />
        </View>
        <TouchableOpacity style={styles.filterButton}><Ionicons name="options" size={20} color="#E2E8F0" /></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category, index) => (
          <TouchableOpacity key={index} onPress={() => setActiveCategory(category)} style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}>
            <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoBadge}>⚡ PROMO SPESIAL</Text>
          <Text style={styles.promoTitle}>Early Bird Discount 20%</Text>
          <Text style={styles.promoDesc}>Main slot pagi & larut malam hemat s.d Rp 50.000 dengan kode LAPAPAGI</Text>
          <TouchableOpacity style={styles.promoBtn}><Text style={styles.promoBtnText}>Klaim Voucher →</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Venue Populer Dekat Anda</Text>
          <Text style={styles.sectionSubtitle}>Rekomendasi venue terbaik di sekitarmu</Text>
        </View>
        <TouchableOpacity><Text style={styles.seeAllText}>Lihat Semua</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {isLoadingVenues ? (
          <Text style={{ color: '#FFF', marginLeft: 20 }}>Memuat data lapangan...</Text>
        ) : (
          // Pengaman mapping Array: Array.isArray(venues) &&
          Array.isArray(venues) && venues.map((venue, index) => (
            <View key={index} style={styles.venueCard}>
              <Image source={{ uri: venue.gambar_url || 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=600' }} style={styles.venueImage} />
              <TouchableOpacity style={styles.heartIcon}><Ionicons name="heart-outline" size={20} color="#FFF" /></TouchableOpacity>
              <View style={styles.venueInfo}>
                <Text style={styles.venueRating}>⭐ {venue.rating || 0} <Text style={styles.reviewCount}>({venue.ulasan || 0}+ ulasan)</Text></Text>
                <Text style={styles.venueName}>{venue.nama_lapangan || 'Lapangan Olahraga'}</Text>
                <Text style={styles.venueDistance}>📍 {venue.lokasi || 'Lokasi tidak diketahui'}</Text>
                <View style={styles.venueFooter}>
                  <View><Text style={styles.priceText}>Rp {venue.harga_per_jam?.toLocaleString('id-ID') || 0} <Text style={styles.priceUnit}>/ jam</Text></Text></View>
                  <TouchableOpacity style={styles.bookBtn}><Text style={styles.bookBtnText}>⚡ Booking</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScrollView>
  );

  const renderSearchScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.simpleHeader}><Text style={styles.simpleHeaderTitle}>Search Courts</Text></View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} value="Badminton Jakarta Selatan" placeholderTextColor="#A0AEC0" />
          <Ionicons name="close-circle" size={20} color="#A0AEC0" />
        </View>
      </View>
      <View style={styles.filterChipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipOutline]}><Ionicons name="options" size={16} color="#A0AEC0" style={{ marginRight: 4 }} /><Text style={styles.filterChipTextOutline}>Filter (2)</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterChipActive}><Ionicons name="navigate" size={16} color="#0B111A" style={{ marginRight: 4 }} /><Text style={styles.filterChipTextActive}>Terdekat (&lt; 5km)</Text><Ionicons name="checkmark" size={16} color="#0B111A" style={{ marginLeft: 4 }} /></TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipOutline]}><Ionicons name="star" size={16} color="#F6E05E" style={{ marginRight: 4 }} /><Text style={styles.filterChipTextOutline}>Rating 4.5+</Text></TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.searchResultHeader}><Text style={styles.searchResultText}><Text style={{ fontWeight: 'bold', color: '#FFF' }}>24 Arena</Text> ditemukan di Jakarta Selatan</Text></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <View style={styles.verticalCard}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop' }} style={styles.verticalCardImage} />
          <View style={styles.badgeTopLeft}><Text style={styles.badgeText}>🟢 3 Lapangan Tersedia</Text></View>
          <View style={styles.verticalCardContent}>
            <View style={styles.cardHeaderRow}><Text style={styles.venueRating}>⭐ 4.9 <Text style={styles.reviewCount}>(340)</Text></Text><Text style={styles.venueDistanceText}>📍 1.4 km</Text></View>
            <Text style={styles.verticalCardTitle}>Grand Smash Arena Cilandak</Text>
            <View style={styles.facilityRow}>
              {['AC', 'Karpet Yonex BWF', 'Parkir Mobil'].map((tag, idx) => (<View key={idx} style={styles.facilityTag}><Text style={styles.facilityTagText}>{tag}</Text></View>))}
            </View>
            <View style={styles.verticalCardFooter}>
              <View><Text style={styles.priceUnit}>Tarif per sesi</Text><Text style={styles.priceText}>Mulai <Text style={{ fontSize: 16 }}>Rp 85.000</Text> <Text style={styles.priceUnit}>/ jam</Text></Text></View>
              <TouchableOpacity style={styles.selectSlotBtn}><Text style={styles.selectSlotBtnText}>Pilih Slot →</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderScheduleScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.simpleHeader}><Text style={styles.simpleHeaderTitle}>Jadwal Anda</Text></View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Tiket Aktif</Text>
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketBadge}>✅ SIAP CHECK-IN</Text>
            <Text style={styles.ticketId}>#LPG-88219</Text>
          </View>
          <Text style={styles.ticketVenue}>Grand Smash Arena Cilandak</Text>
          <Text style={styles.ticketCourt}>Badminton Pro - Court 1 (Vinyl Pro)</Text>
          <View style={styles.ticketDetails}>
            <View style={styles.ticketDetailBox}><Ionicons name="calendar-outline" size={16} color="#A0AEC0" /><Text style={styles.ticketDetailText}>Rabu, 25 Okt 2026</Text></View>
            <View style={styles.ticketDetailBox}><Ionicons name="time-outline" size={16} color="#A0AEC0" /><Text style={styles.ticketDetailText}>18:00 - 20:00 WIB</Text></View>
          </View>
          <View style={styles.ticketDivider} />
          <TouchableOpacity style={styles.qrButton}><Ionicons name="qr-code" size={20} color="#0B111A" style={{ marginRight: 8 }} /><Text style={styles.qrButtonText}>Tampilkan QR E-Tiket</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderProfileScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.simpleHeader}><Text style={styles.simpleHeaderTitle}>Player Profile</Text></View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.profileCardMain}>
          <View style={styles.profileHeaderRow}>
            <View>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.profileAvatarBig} />
              <View style={styles.verifiedBadge}><Ionicons name="checkmark" size={12} color="#FFF" /></View>
            </View>
            <TouchableOpacity style={styles.editProfileBtn}>
              <Ionicons name="pencil" size={12} color="#2ECC71" style={{ marginRight: 4 }} />
              <Text style={{ color: '#2ECC71', fontSize: 12 }}>Edit Profil</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.nama || 'Alex Pratama'}</Text>
          <View style={styles.memberBadge}><Text style={styles.memberBadgeText}>⭐ Gold Athlete Member</Text></View>
          <Text style={styles.profileContact}>✉️ {user?.email || 'email@domain.com'}</Text>
          <Text style={styles.profileContact}>🔑 Akun {user?.peran || 'Konsumen'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNumber}>24</Text><Text style={styles.statLabel}>Pertandingan</Text></View>
          <View style={[styles.statBox, styles.statBorder]}><Text style={styles.statNumber}>48 <Text style={{ fontSize: 14, fontWeight: 'normal' }}>Jam</Text></Text><Text style={styles.statLabel}>Main Terdata</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>3</Text><Text style={styles.statLabel}>Venue Favorit</Text></View>
        </View>

        <TouchableOpacity style={styles.mitraButton}>
          <Ionicons name="business" size={24} color="#0B111A" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.mitraSubtitle}>PORTAL MITRA ARENA</Text>
            <Text style={styles.mitraTitle}>Mode Pengelola Venue</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#0B111A" />
        </TouchableOpacity>

        <Text style={styles.sectionMenuTitle}>PREFERENSI & BANTUAN</Text>
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconBg}><Ionicons name="notifications" size={18} color="#F6AD55" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.menuItemTitle}>Notifikasi Jadwal & Promo</Text><Text style={styles.menuItemSub}>Pengingat 2 jam sebelum main</Text></View>
            <Switch trackColor={{ false: '#2D3748', true: '#2ECC71' }} thumbColor={notifEnabled ? '#FFF' : '#A0AEC0'} onValueChange={() => setNotifEnabled(!notifEnabled)} value={notifEnabled} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FC8181" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>LapaGo App v2.4.0</Text>
      </View>
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'Explore': return renderExploreScreen();
      case 'Search': return renderSearchScreen();
      case 'Schedule': return renderScheduleScreen();
      case 'Profile': return renderProfileScreen();
      default: return renderExploreScreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContentArea}>{renderCurrentScreen()}</View>
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => {
          const isActive = activeTab === item.label;
          return (
            <TouchableOpacity key={index} style={styles.navItem} onPress={() => setActiveTab(item.label)}>
              <Ionicons name={item.icon} size={24} color={isActive ? '#2ECC71' : '#718096'} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 3. KOMPONEN UTAMA (ENTRY POINT APP)
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <SafeAreaProvider>
      {currentUser ? (
        <HomeDashboard user={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <AuthScreen onLoginSuccess={(userData) => setCurrentUser(userData)} />
      )}
    </SafeAreaProvider>
  );
}

// ==========================================
// STYLESHEET LENGKAP
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B111A' },
  mainContentArea: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Auth Screen
  authContainer: { flex: 1, backgroundColor: '#0B111A', justifyContent: 'center' },
  authContent: { paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  authBrandText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  authSubtitle: { color: '#A0AEC0', fontSize: 16, marginTop: 8 },
  formContainer: { marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A202C', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 56, borderWidth: 1, borderColor: '#2D3748' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  submitBtn: { backgroundColor: '#2ECC71', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#0B111A', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  toggleText: { color: '#A0AEC0', fontSize: 14 },
  toggleTextHighlight: { color: '#2ECC71', fontSize: 14, fontWeight: 'bold' },

  // Header Dashboard
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  greeting: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#E2E8F0', fontSize: 13, marginHorizontal: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { backgroundColor: '#1A202C', padding: 10, borderRadius: 50, marginRight: 12 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  simpleHeader: { padding: 20, paddingBottom: 10 },
  simpleHeaderTitle: { color: '#2ECC71', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },

  // Search & Filter
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A202C', borderRadius: 12, paddingHorizontal: 12, marginRight: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', height: 48 },
  filterButton: { backgroundColor: '#1A202C', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryScroll: { paddingHorizontal: 20, marginBottom: 24, flexGrow: 0 },
  categoryChip: { backgroundColor: '#1A202C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#2D3748' },
  categoryChipActive: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  categoryText: { color: '#A0AEC0', fontWeight: '600' },
  categoryTextActive: { color: '#0B111A' },
  filterChipsRow: { marginBottom: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipOutline: { borderWidth: 1, borderColor: '#4A5568', backgroundColor: 'transparent' },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipTextOutline: { color: '#A0AEC0', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#0B111A', fontSize: 13, fontWeight: '600' },

  // Cards (Explore)
  promoBanner: { backgroundColor: '#132A23', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 24 },
  promoBadge: { color: '#2ECC71', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  promoTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  promoDesc: { color: '#A0AEC0', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  promoBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  promoBtnText: { color: '#0B111A', fontWeight: 'bold', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16, alignItems: 'center' },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  sectionSubtitle: { color: '#A0AEC0', fontSize: 12, marginTop: 2 },
  seeAllText: { color: '#2ECC71', fontSize: 13, fontWeight: '600' },
  horizontalList: { paddingLeft: 20, flexGrow: 0 },
  venueCard: { width: 260, backgroundColor: '#1A202C', borderRadius: 16, marginRight: 16, overflow: 'hidden' },
  venueImage: { width: '100%', height: 140 },
  heartIcon: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 50 },
  venueInfo: { padding: 16 },
  venueRating: { color: '#F6E05E', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  reviewCount: { color: '#A0AEC0', fontWeight: 'normal' },
  venueName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  venueDistance: { color: '#A0AEC0', fontSize: 12, marginBottom: 12 },
  venueFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#2ECC71', fontSize: 15, fontWeight: 'bold' },
  priceUnit: { color: '#A0AEC0', fontSize: 12, fontWeight: 'normal' },
  bookBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bookBtnText: { color: '#0B111A', fontSize: 12, fontWeight: 'bold' },

  // Vertical Cards (Search)
  searchResultHeader: { paddingHorizontal: 20, marginBottom: 12 },
  searchResultText: { color: '#A0AEC0', fontSize: 13 },
  verticalCard: { backgroundColor: '#1A202C', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  verticalCardImage: { width: '100%', height: 160 },
  badgeTopLeft: { position: 'absolute', top: 12, left: 12, backgroundColor: '#22543D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#48BB78', fontSize: 11, fontWeight: 'bold' },
  verticalCardContent: { padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  venueDistanceText: { color: '#A0AEC0', fontSize: 12 },
  verticalCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  facilityRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  facilityTag: { backgroundColor: '#2D3748', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  facilityTagText: { color: '#E2E8F0', fontSize: 11 },
  verticalCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#2D3748', paddingTop: 12 },
  selectSlotBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  selectSlotBtnText: { color: '#0B111A', fontWeight: 'bold', fontSize: 13 },

  // Profile
  profileCardMain: { backgroundColor: '#1A202C', borderRadius: 16, padding: 20, marginBottom: 16 },
  profileHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  profileAvatarBig: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#2ECC71' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2ECC71', padding: 2, borderRadius: 10, borderWidth: 2, borderColor: '#1A202C' },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22543D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  profileName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  memberBadge: { backgroundColor: '#744210', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  memberBadgeText: { color: '#F6E05E', fontSize: 11, fontWeight: 'bold' },
  profileContact: { color: '#A0AEC0', fontSize: 13, marginBottom: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A202C', borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2D3748' },
  statNumber: { color: '#2ECC71', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#A0AEC0', fontSize: 11 },
  mitraButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ECC71', padding: 16, borderRadius: 16, marginBottom: 24 },
  mitraSubtitle: { color: '#132A23', fontSize: 10, fontWeight: 'bold' },
  mitraTitle: { color: '#0B111A', fontSize: 16, fontWeight: 'bold' },
  sectionMenuTitle: { color: '#A0AEC0', fontSize: 12, fontWeight: 'bold', marginLeft: 4, marginBottom: 8, letterSpacing: 0.5 },
  menuGroup: { backgroundColor: '#1A202C', borderRadius: 16, paddingVertical: 8, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  menuIconBg: { backgroundColor: '#2D3748', padding: 8, borderRadius: 8 },
  menuItemTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  menuItemSub: { color: '#A0AEC0', fontSize: 12, marginTop: 2 },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 },
  logoutText: { color: '#FC8181', fontSize: 15, fontWeight: 'bold' },
  versionText: { color: '#4A5568', fontSize: 11, textAlign: 'center', marginTop: 8 },

  // Schedule (Ticket)
  ticketCard: { backgroundColor: '#1A202C', borderRadius: 16, padding: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ticketBadge: { color: '#2ECC71', fontSize: 12, fontWeight: 'bold' },
  ticketId: { color: '#A0AEC0', fontSize: 12 },
  ticketVenue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  ticketCourt: { color: '#A0AEC0', fontSize: 14, marginBottom: 16 },
  ticketDetails: { flexDirection: 'row', marginBottom: 16 },
  ticketDetailBox: { flexDirection: 'row', alignItems: 'center', marginRight: 16, backgroundColor: '#2D3748', padding: 8, borderRadius: 8 },
  ticketDetailText: { color: '#E2E8F0', fontSize: 12, marginLeft: 6 },
  ticketDivider: { height: 1, backgroundColor: '#2D3748', marginBottom: 16, borderStyle: 'dashed' },
  qrButton: { flexDirection: 'row', backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  qrButtonText: { color: '#0B111A', fontSize: 14, fontWeight: 'bold' },

  // Bottom Navigation
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0B111A', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1A202C' },
  navItem: { alignItems: 'center' },
  navLabel: { color: '#718096', fontSize: 10, marginTop: 4 },
  navLabelActive: { color: '#2ECC71' }
});