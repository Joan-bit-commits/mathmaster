import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AppBar from '../../src/components/ui/AppBar';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import { useAuthStore } from '../../src/stores/authStore';

const ROLES = [
  { key: 'student', label: 'Student', icon: 'school', blurb: 'Learn & practice' },
  { key: 'teacher', label: 'Teacher', icon: 'person', blurb: 'Teach & track' },
];

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [role, setRole] = useState('student'); // smart default
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) ? 3 : password.length >= 8 ? 2 : password.length ? 1 : 0;
  const strengthLabels = ['Too short', 'Weak', 'Okay', 'Strong'];

  const handleRegister = async () => {
    setError('');
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ username, email, role, password, password2 });
      router.replace('/(auth)/register-success');
    } catch (e) {
      setError(e.message === 'NETWORK_ERROR' ? 'Cannot reach the server. Check your connection.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Register screen">
      <AppBar title="Create account" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-[24px] pb-10 pt-4" keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(300)}>
            <View className="flex-row gap-3 mb-6">
              {ROLES.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${r.label} role`}
                  accessibilityState={{ selected: role === r.key }}
                  className={`flex-1 rounded-2xl p-4 border-2 items-center ${role === r.key ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}
                >
                  <MaterialIcon name={r.icon} size={28} color={role === r.key ? 'primary' : 'on-surface-variant'} />
                  <Text className={`font-title-lg text-title-lg mt-2 ${role === r.key ? 'text-primary' : 'text-on-surface'}`}>{r.label}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{r.blurb}</Text>
                </Pressable>
              ))}
            </View>

            <Input label="Username" leftIcon="person" value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" textContentType="username" />
            <Input label="Email" leftIcon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
            <Input
              label="Password"
              leftIcon="lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
              textContentType="newPassword"
              helperText={strength > 0 ? `Password strength: ${strengthLabels[strength]}` : 'At least 8 characters with an uppercase letter and a digit.'}
            />
            {strength > 0 ? (
              <View className="flex-row gap-1 mb-4 -mt-2" accessibilityLabel={`Password strength ${strengthLabels[strength]}`}>
                {[1, 2, 3].map((s) => (
                  <View key={s} className={`h-1 flex-1 rounded-full ${s <= strength ? (strength === 3 ? 'bg-success' : strength === 2 ? 'bg-[#d88a00]' : 'bg-error') : 'bg-surface-variant'}`} />
                ))}
              </View>
            ) : null}
            <Input
              label="Confirm password"
              leftIcon="lock"
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry={!showPassword}
              error={password2 && password !== password2 ? 'Passwords do not match.' : ''}
            />
            {error ? (
              <Text className="font-body-sm text-body-sm text-error mb-3" accessibilityLiveRegion="polite">{error}</Text>
            ) : null}
            <Button label="Create account" onPress={handleRegister} loading={loading} fullWidth accessibilityLabel="Create account" />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
