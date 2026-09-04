import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AnimatedBackground from '../../src/components/ui/AnimatedBackground';
import AnimatedLogo from '../../src/components/ui/AnimatedLogo';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import SegmentedControl from '../../src/components/ui/SegmentedControl';
import KeyboardScreen from '../../src/components/ui/KeyboardScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [demoRole, setDemoRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (isDemo) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(
        isDemo ? (demoRole === 'teacher' ? 'teacher_demo' : 'student_demo') : username,
        isDemo ? 'Str0ngPass!' : password
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
      <AnimatedBackground colors={['#006591', '#4648d4']} />
      <KeyboardScreen className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-[24px] py-10" keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(400)} className="items-center mb-8">
            <AnimatedLogo emoji="📐" size={72} />
            <Text accessibilityRole="header" className="text-[26px] leading-9 font-semibold text-on-surface mt-4">Welcome back</Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sign in to continue your learning</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Input label="Username" leftIcon="person" value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" textContentType="username" accessibilityLabel="Username" />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <Input
              label="Password" leftIcon="lock" value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
              autoComplete="password" textContentType="password"
              rightIcon={showPassword ? 'visibility-off' : 'visibility'} onRightIconPress={() => setShowPassword(!showPassword)}
              accessibilityLabel="Password"
            />
          </Animated.View>

          {error ? <Text className="font-body-sm text-body-sm text-error mb-3" accessibilityLiveRegion="polite">{error}</Text> : null}

          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <Pressable onPress={() => {}} accessibilityRole="link" accessibilityLabel="Forgot password" className="self-end mb-4">
              <Text className="font-label-sm text-label-sm text-primary">Forgot password?</Text>
            </Pressable>
            <Button label="Sign In" onPress={() => handleLogin(false)} loading={loading} fullWidth accessibilityLabel="Sign in" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(400)} className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-outline-variant" />
            <Text className="px-2 font-body-sm text-body-sm text-outline">or try a demo</Text>
            <View className="flex-1 h-px bg-outline-variant" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340).duration(400)}>
            <SegmentedControl
              options={[{ key: 'student', label: 'Student' }, { key: 'teacher', label: 'Teacher' }]}
              value={demoRole}
              onChange={setDemoRole}
              className="mb-4"
            />
            <Button
              label={`Continue as ${demoRole === 'teacher' ? 'Teacher' : 'Student'} demo`}
              variant="secondary"
              onPress={() => handleLogin(true)}
              fullWidth
              accessibilityLabel={`Continue as ${demoRole} demo`}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="items-center mt-8">
            <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="button" accessibilityLabel="Create an account">
              <Text className="font-label-sm text-label-sm text-on-surface-variant">
                New here? <Text className="text-primary font-semibold">Create an account</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardScreen>
    </SafeAreaView>
  );
}