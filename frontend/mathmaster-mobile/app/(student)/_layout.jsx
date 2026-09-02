// app/student/_layout.jsx — outer Stack
import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ai-tutor/history" />
      <Stack.Screen name="ai-tutor/chat/[sessionId]" />
      <Stack.Screen name="topic/[id]" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="lesson/[id]/quizzes" />
      <Stack.Screen name="quiz/[id]" />
      <Stack.Screen name="quiz/[id]/results" />
      <Stack.Screen name="performance/[period]" />
    </Stack>
  );
}