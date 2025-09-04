import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Stack, useRouter, type Href, Link } from 'expo-router';

export default function SignUp() {
  const router = useRouter();
  const toHome = '/home' satisfies Href;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignUp = () => {
    // Frontend-only validations
    if (!fullName.trim() || !email.trim() || !pwd.trim() || !confirm.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    if (pwd.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (pwd !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    // In a real app, call your API here. For now, just go to Home:
    router.replace(toHome);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.brand}>Create your account</Text>
            <Text style={styles.subtitle}>Join Tag4Access in minutes</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Doe"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={pwd}
                onChangeText={setPwd}
                placeholder="At least 8 characters"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Re-enter password"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable onPress={handleSignUp} style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
              <Text style={styles.primaryBtnText}>Create account</Text>
            </Pressable>

            <View style={styles.bottomRow}>
              <Text style={{ color: '#6B7280' }}>Already have an account? </Text>
              <Link href="/" style={styles.link}>Sign in</Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F7F8FA' },
  card: {
    borderRadius: 16, backgroundColor: '#FFFFFF', padding: 20, gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  brand: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 8 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FAFAFA',
  },
  primaryBtn: { backgroundColor: '#0A84FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  primaryBtnPressed: { opacity: 0.85 },
  primaryBtnText: { color: 'white', fontWeight: '600' },
  bottomRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#0A84FF', fontWeight: '600' },
});
