import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'lapago.profile';
const SESSION_KEY = 'lapago.session';

export const defaultProfile = {
  name: 'Alex Pratama',
  phone: '0812-8899-7722',
  email: 'alex.pratama@email.com',
};

export async function loadProfile() {
  const savedProfile = await AsyncStorage.getItem(PROFILE_KEY);
  return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  const session = await loadSession();
  if (session) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, profile }));
  }
}

export async function loadSession() {
  const savedSession = await AsyncStorage.getItem(SESSION_KEY);
  return savedSession ? JSON.parse(savedSession) : null;
}

export async function saveSession(token, profile) {
  await AsyncStorage.multiSet([
    [SESSION_KEY, JSON.stringify({ token, profile })],
    [PROFILE_KEY, JSON.stringify(profile)],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([SESSION_KEY, PROFILE_KEY]);
}
