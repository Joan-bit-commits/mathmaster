import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import AppBar from '../../src/components/ui/AppBar';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import KeyboardScreen from '../../src/components/ui/KeyboardScreen';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import PasswordStrengthMeter from '../../src/components/ui/PasswordStrengthMeter';
import StepDots from '../../src/components/ui/StepDots';
import { useAuthStore } from '../../src/stores/authStore';

const ROLES = [
  { key: 'student', label: 'Student', icon: 'school', blurb: 'Learn & practice' },
  { key: 'teacher', label: 'Teacher', icon: 'person', blurb: 'Teach & track' },
];
const STEPS = ['role', 'credentials'];

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('teacher');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength =
    password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) ? 3 : password.length >= 8 ? 2 : password.length ? 1 : 0;

  const goNext = () => {
    setError('');
    if (!username.trim() || !email.trim()) {
      setError('Please fill in your username and email.');
      return;
    }
    setStep(1);
  };

  const handleRegister = async () => {
    setError('');
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, role, password, password2 });
      router.replace('/(auth)/register-success');
    } catch (e) {
      setError(e.message === 'NETWORK_ERROR' ? 'Cannot reach the server. Check your connection.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Register screen">
      <AnimatedBackground colors={['#006591', '#4648d4']} />
      <AppBar title="Create account" onBack={() => (step === 0 ? router.back() : setStep(0))} />
      <KeyboardScreen className="flex-1">
        <View className="px-[24px] pt-4">
          <StepDots count={STEPS.length} activeIndex={step} className="mb-6" />
        </View>
        <ScrollView contentContainerClassName="px-[24px] pb-10" keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <Animated.View key="role-step" entering={SlideInRight.duration(280)} exiting={SlideOutLeft.duration(200)}>
              <Text className="text-[22px] leading-8 font-semibold text-on-surface mb-1">Who's learning today?</Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant mb-6">Choose your role — you can't change this later.</Text>

              <View className="flex-row gap-3 mb-6">
                {ROLES.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => setRole(r.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${r.label} role`}
                    accessibilityState={{ selected: role === r.key }}
                    className={`flex-1 rounded-2xl p-4 items-center ${role === r.key ? 'bg-primary' : 'bg-surface-container-lowest shadow-level-1'}`}
                  >
                    <MaterialIcon name={r.icon} size={28} color={role === r.key ? 'on-primary' : 'on-surface-variant'} />
                    <Text className={`font-title-lg text-title-lg mt-2 ${role === r.key ? 'text-on-primary' : 'text-on-surface'}`}>{r.label}</Text>
                    <Text className={`font-label-sm text-label-sm ${role === r.key ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>{r.blurb}</Text>
                  </Pressable>
                ))}
              </View>

              <Input label="Username" leftIcon="person" value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" textContentType="username" />
              <Input label="Email" leftIcon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />

              {error ? <Text className="font-body-sm text-body-sm text-error mb-3" accessibilityLiveRegion="polite">{error}</Text> : null}

              <Button label="Continue" onPress={goNext} fullWidth accessibilityLabel="Continue to password step" />
            </Animated.View>
          ) : (
            <Animated.View key="credentials-step" entering={SlideInRight.duration(280)} exiting={SlideOutLeft.duration(200)}>
              <Text className="text-[22px] leading-8 font-semibold text-on-surface mb-1">Secure your account</Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant mb-6">Pick a strong password you'll remember.</Text>

              <Input
                label="Password" leftIcon="lock" value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'visibility-off' : 'visibility'} onRightIconPress={() => setShowPassword(!showPassword)}
                autoComplete="new-password" textContentType="newPassword"
                helperText={strength === 0 ? 'At least 8 characters with an uppercase letter and a digit.' : undefined}
              />
              <PasswordStrengthMeter strength={strength} />
              <Input
                label="Confirm password" leftIcon="lock" value={password2} onChangeText={setPassword2} secureTextEntry={!showPassword}
                error={password2 && password !== password2 ? 'Passwords do not match.' : ''}
              />

              {error ? <Text className="font-body-sm text-body-sm text-error mb-3" accessibilityLiveRegion="polite">{error}</Text> : null}

              <Button label="Create account" onPress={handleRegister} loading={loading} fullWidth accessibilityLabel="Create account" />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardScreen>
    </SafeAreaView>
  );
}