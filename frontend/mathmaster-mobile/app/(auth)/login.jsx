import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(
        demoRole === 'teacher' ? 'teacher_demo' : username || 'student_demo',
        password || 'Str0ngPass!'
      );
      router.replace(user.role === 'teacher' ? '/(teacher)' : '/(student)');
    } catch (e) {
      setError(e.message === 'NETWORK_ERROR' ? 'Cannot reach the server. Check your connection.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" accessibilityLabel="Login screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-[24px]" keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(300)}>
            <View className="mb-8">
              <Text accessibilityRole="header" className="text-[28px] leading-9 font-semibold text-on-surface mb-2">
                Welcome back 👋
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Sign in to continue your learning
              </Text>
            </View>

            <View className="bg-surface-container-lowest rounded-[24px] p-[20px] border border-[#d3e4fe]/50 shadow-level-1">
              <Input
                label="Username"
                leftIcon="person"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                accessibilityLabel="Username"
              />
              <Input
                label="Password"
                leftIcon="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                accessibilityLabel="Password"
              />
              {error ? (
                <Text className="font-body-sm text-body-sm text-error mb-3" accessibilityLiveRegion="polite">
                  {error}
                </Text>
              ) : null}
              <Pressable onPress={() => {}} accessibilityRole="link" accessibilityLabel="Forgot password" className="self-end mb-4">
                <Text className="font-label-sm text-label-sm text-primary">Forgot password?</Text>
              </Pressable>
              <Button label="Sign In" onPress={() => handleLogin()} loading={loading} fullWidth accessibilityLabel="Sign in" />
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-px bg-outline-variant" />
                <Text className="px-2 font-body-sm text-body-sm text-outline">or</Text>
                <View className="flex-1 h-px bg-outline-variant" />
              </View>
              <Button label="Create an account" variant="gradient" onPress={() => router.push('/(auth)/register')} fullWidth accessibilityLabel="Create an account" />
            </View>

            <View className="mt-8 flex-row justify-center gap-2">
              <Pressable
                onPress={() => handleLogin('student')}
                accessibilityRole="button"
                accessibilityLabel="Continue as student demo"
                className="px-4 py-2 rounded-full border-[1.5px] border-primary active:opacity-80 flex-row items-center gap-1"
              >
                <MaterialIcon name="school" size={16} color="primary" />
                <Text className="font-label-sm text-label-sm text-primary">Continue as Student</Text>
              </Pressable>
              <Pressable
                onPress={() => handleLogin('teacher')}
                accessibilityRole="button"
                accessibilityLabel="Continue as teacher demo"
                className="px-4 py-2 rounded-full border-[1.5px] border-primary active:opacity-80 flex-row items-center gap-1"
              >
                <MaterialIcon name="person" size={16} color="primary" />
                <Text className="font-label-sm text-label-sm text-primary">Continue as Teacher</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
