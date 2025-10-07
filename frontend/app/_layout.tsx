import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTintColor: '#0A84FF' }}>
      <Stack.Screen name="index"  options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="home"   options={{ title: 'Home' }} />
      <Stack.Screen name="admin"  options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="progress" options={{ title: 'Progress Log' }} />
    </Stack>
  );
}

