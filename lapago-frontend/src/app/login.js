import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Heading, Panel, Screen } from '../components/Ui';
import { useAuth } from '../constants/auth-context';
import { apiRequest } from '../constants/api';
import { colors } from '../constants/theme';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  const submit = async () => {
    setError('');
    setSuccess('');
    if (!email.trim() || !password || (isRegistering && (!name.trim() || !phone.trim()))) {
      setError('Lengkapi semua data yang diperlukan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest(isRegistering ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          ...(isRegistering ? { name: name.trim(), phone: phone.trim() } : {}),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      if (isRegistering) {
        setMode('login');
        setPassword('');
        setSuccess('Akun berhasil dibuat. Silakan masuk dengan akun baru Anda.');
        return;
      }

      await signIn(result.token, result.profile);
      router.replace('/(tabs)');
    } catch (submitError) {
      console.error(isRegistering ? 'Gagal membuat akun:' : 'Gagal login:', submitError);
      setError(submitError.message || 'Permintaan gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.brand}>
        <View style={styles.brandIcon}><Ionicons name="football" size={25} color={colors.onPrimary} /></View>
        <Text style={styles.brandName}>LapaGo</Text>
      </View>
      <Heading
        title={isRegistering ? 'Buat Akun' : 'Selamat Datang'}
        subtitle={isRegistering ? 'Daftar untuk mulai memesan lapangan' : 'Masuk untuk melihat akun dan booking-mu'}
      />

      <Panel style={styles.form}>
        {isRegistering ? (
          <>
            <Field label="NAMA LENGKAP" value={name} onChangeText={setName} placeholder="Contoh: Budi Santoso" autoCapitalize="words" />
            <Field label="NOMOR TELEPON" value={phone} onChangeText={setPhone} placeholder="Contoh: 081234567890" keyboardType="phone-pad" />
          </>
        ) : null}
        <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field
          label="KATA SANDI"
          value={password}
          onChangeText={setPassword}
          placeholder={isRegistering ? 'Minimal 8 karakter' : 'Masukkan kata sandi'}
          secureTextEntry
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <ActionButton
          label={isSubmitting ? 'Memproses...' : isRegistering ? 'Buat Akun' : 'Masuk'}
          icon={isRegistering ? 'person-add-outline' : 'log-in-outline'}
          disabled={isSubmitting}
          onPress={submit}
        />
      </Panel>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>
          {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
        </Text>
        <Pressable
          onPress={() => {
            setMode(isRegistering ? 'login' : 'register');
            setError('');
            setSuccess('');
          }}
        >
          <Text style={styles.switchAction}>{isRegistering ? 'Masuk' : 'Buat akun'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  brandName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  form: { gap: 16 },
  field: { gap: 7 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  input: { minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, backgroundColor: colors.surface, color: colors.text, fontSize: 13 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  success: { color: colors.primary, fontSize: 12, lineHeight: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  switchText: { color: colors.muted, fontSize: 12 },
  switchAction: { color: colors.primary, fontSize: 12, fontWeight: '800' },
});
