import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../constants/auth-context';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigation />
    </AuthProvider>
  );
}

function AppNavigation() {
  const { authenticated } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="arena" />
        <Stack.Screen name="booking-form" />
        <Stack.Screen name="pembayaran" />
        <Stack.Screen name="tiket" />
      </Stack.Protected>
    </Stack>
  );
}