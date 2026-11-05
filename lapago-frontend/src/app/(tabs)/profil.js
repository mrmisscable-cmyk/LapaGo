import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Heading, IconButton, Panel, Screen } from '../../components/Ui';
import { useAuth } from '../../constants/auth-context';
import { apiRequest } from '../../constants/api';
import { colors, radius } from '../../constants/theme';
import { defaultProfile, loadProfile, saveProfile } from '../../constants/profile';

export default function Profil() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(defaultProfile);
  const [draft, setDraft] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let isMounted = true;

    loadProfile()
      .then((savedProfile) => {
        if (isMounted) setProfile(savedProfile);
      })
      .catch((loadError) => {
        console.error('Gagal memuat profil:', loadError);
        Alert.alert('Profil tidak dapat dimuat', 'Silakan coba buka kembali menu profil.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []));

  const openEditor = () => {
    setDraft({ ...profile });
    setError('');
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setError('');
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const saveChanges = async () => {
    const updatedProfile = {
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
    };
    const phoneDigits = updatedProfile.phone.replace(/\D/g, '');

    if (!updatedProfile.name || !updatedProfile.phone || !updatedProfile.email) {
      setError('Nama, nomor telepon, dan email wajib diisi.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedProfile.email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    if (!/^[0-9+()\-\s]+$/.test(updatedProfile.phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      setError('Nomor telepon harus berisi 8–15 angka. Tanda +, -, dan spasi diperbolehkan.');
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(updatedProfile),
      });
      await saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError('');
    } catch (saveError) {
      console.error('Gagal menyimpan profil:', saveError);
      setError('Perubahan gagal disimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Keluar dari akun?', 'Kamu perlu masuk kembali untuk menggunakan LapaGo.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => signOut().catch((signOutError) => {
          console.error('Gagal keluar dari akun:', signOutError);
          Alert.alert('Gagal keluar', 'Silakan coba lagi.');
        }),
      },
    ]);
  };

  const links = [
    { icon: 'person-outline', title: 'Informasi Pribadi', subtitle: 'Atur data dan kontak akunmu' },
    { icon: 'card-outline', title: 'Metode Pembayaran', subtitle: 'Kelola metode pembayaran' },
    { icon: 'heart-outline', title: 'Arena Favorit', subtitle: 'Lapangan yang kamu simpan' },
    { icon: 'help-circle-outline', title: 'Bantuan & Dukungan', subtitle: 'Kami siap membantu' },
    { icon: 'settings-outline', title: 'Pengaturan', subtitle: 'Preferensi aplikasi' },
  ];

  return (
    <Screen>
      <View style={styles.top}>
        <Heading title="Profil Saya" subtitle="Kelola akun dan preferensimu" />
        <IconButton name="settings-outline" />
      </View>
      <Panel style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{isLoading ? 'Memuat profil…' : profile.name}</Text>
            <View style={styles.member}><Ionicons name="ribbon" size={13} color={colors.warning} /><Text style={styles.memberText}>Gold Athlete Member</Text></View>
          </View>
          <Pressable style={styles.editButton} onPress={openEditor} accessibilityRole="button" accessibilityLabel="Edit profil">
            <Ionicons name="create-outline" size={14} color={colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>
        <View style={styles.separator} />
        <View style={styles.contact}>
          <Ionicons name="call-outline" size={14} color={colors.muted} />
          <Text style={styles.contactText}>{profile.phone}</Text>
        </View>
        <View style={styles.contact}>
          <Ionicons name="mail-outline" size={14} color={colors.muted} />
          <Text style={styles.contactText}>{profile.email}</Text>
        </View>
      </Panel>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Total Booking</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>4.9</Text><Text style={styles.statLabel}>Rating Saya</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>320</Text><Text style={styles.statLabel}>Poin LapaGo</Text></View>
      </View>
      <Text style={styles.sectionTitle}>AKUN & PREFERENSI</Text>
      <Panel style={styles.menu}>
        {links.map((link, index) => (
          <Pressable key={link.title} style={[styles.menuRow, index !== links.length - 1 && styles.menuBorder]}>
            <View style={styles.menuIcon}><Ionicons name={link.icon} size={18} color={colors.primary} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>{link.title}</Text><Text style={styles.menuSubtitle}>{link.subtitle}</Text></View>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        ))}
      </Panel>
      <Pressable style={styles.logout} onPress={confirmSignOut}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </Pressable>
      <Text style={styles.version}>LapaGo v1.0.0</Text>
      <Modal visible={isEditing} transparent animationType="fade" onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>Edit Profil</Text>
                <Text style={styles.modalSubtitle}>Perbarui informasi kontak akunmu</Text>
              </View>
              <Pressable onPress={closeEditor} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Tutup">
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA LENGKAP</Text>
              <TextInput
                value={draft.name}
                onChangeText={(value) => updateDraft('name', value)}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOMOR TELEPON</Text>
              <TextInput
                value={draft.phone}
                onChangeText={(value) => updateDraft('phone', value)}
                placeholder="Contoh: 081234567890"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput
                value={draft.email}
                onChangeText={(value) => updateDraft('email', value)}
                placeholder="nama@email.com"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable onPress={closeEditor} style={styles.cancelButton} disabled={isSaving} accessibilityRole="button">
                <Text style={styles.cancelText}>Batal</Text>
              </Pressable>
              <Pressable onPress={saveChanges} style={[styles.saveButton, isSaving && styles.disabledButton]} disabled={isSaving} accessibilityRole="button">
                <Ionicons name="checkmark" size={17} color={colors.onPrimary} />
                <Text style={styles.saveText}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileCard: { padding: 16 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: colors.cardHighest, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary },
  avatarText: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  userInfo: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' },
  member: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberText: { color: colors.warning, fontSize: 10, fontWeight: '700' },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 10, backgroundColor: colors.surface },
  editText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 3 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { color: colors.muted, fontSize: 11 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 15, borderRadius: radius.lg, backgroundColor: colors.card },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 9 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionTitle: { color: colors.muted, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: -10 },
  menu: { paddingVertical: 0, paddingHorizontal: 14, gap: 0 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, gap: 3 },
  menuTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  menuSubtitle: { color: colors.muted, fontSize: 9 },
  logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 12 },
  logoutText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  version: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: -8 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000A8' },
  modalCard: { padding: 20, borderRadius: radius.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  modalHeading: { flex: 1, gap: 4 },
  modalTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  modalSubtitle: { color: colors.muted, fontSize: 11 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  field: { gap: 7 },
  fieldLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  input: { minHeight: 46, paddingHorizontal: 13, borderRadius: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 11, lineHeight: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 2 },
  cancelButton: { minHeight: 42, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 11, backgroundColor: colors.cardHighest },
  cancelText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  saveButton: { minHeight: 42, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 11, backgroundColor: colors.primary },
  disabledButton: { opacity: 0.65 },
  saveText: { color: colors.onPrimary, fontSize: 12, fontWeight: '800' },
});