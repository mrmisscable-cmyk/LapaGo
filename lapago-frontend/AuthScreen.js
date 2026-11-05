import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  // Ganti IP ini dengan IP Address WiFi komputer Anda jika test di HP (contoh: 192.168.1.x)
  // Atau gunakan 'http://10.0.2.2:3000' jika menggunakan Emulator Android di laptop
  const API_URL = 'http://192.168.x.x:3000/api/pengguna'; 

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!nama || !whatsapp))) {
      Alert.alert('Error', 'Harap lengkapi semua data!');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { email, password } 
      : { nama, email, whatsapp, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', isLogin ? 'Berhasil Login!' : 'Registrasi Berhasil! Silakan Login.');
        if (isLogin) {
          // Panggil fungsi untuk pindah ke halaman HomeDashboard
          if(onLoginSuccess) onLoginSuccess(data.user);
        } else {
          setIsLogin(true); // Pindah ke tab login setelah register sukses
        }
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal terhubung ke server. Pastikan backend menyala.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="strategy" size={48} color="#2ECC71" />
          <Text style={styles.brandText}>LapaGo</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}
          </Text>
        </View>

        {/* Form Section */}
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

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#0B111A" />
            ) : (
              <Text style={styles.submitBtnText}>{isLogin ? 'Masuk' : 'Daftar Sekarang'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle Login/Register */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleTextHighlight}>
              {isLogin ? 'Daftar' : 'Masuk'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B111A', justifyContent: 'center' },
  content: { paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  brandText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  subtitle: { color: '#A0AEC0', fontSize: 16, marginTop: 8 },
  formContainer: { marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A202C', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 56, borderWidth: 1, borderColor: '#2D3748' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  submitBtn: { backgroundColor: '#2ECC71', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#0B111A', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  toggleText: { color: '#A0AEC0', fontSize: 14 },
  toggleTextHighlight: { color: '#2ECC71', fontSize: 14, fontWeight: 'bold' }
});