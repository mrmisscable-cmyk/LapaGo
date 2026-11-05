import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function Placeholder({ title }) {
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>Halaman ini dibuat di tahap berikutnya.</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, marginTop: 6 },
});