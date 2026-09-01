import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Card from '../../../../src/components/ui/Card';
import MaterialIcon from '../../../../src/components/ui/MaterialIcon';
import Screen from '../../../../src/components/ui/Screen';
import { friendlyDate } from '../../../../src/lib/format';
import { useTeacherStudents } from '../../../../src/hooks';

/** Teacher view of student_performance_detail. */
export default function TeacherStudentDetailScreen() {
  const { id } = useLocalSearchParamsRouter();
  const { data: students } = useTeacherStudents();
  const student = students?.find((s) => String(s.id) === String(id)) || students?.[0];

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Student detail (teacher)">
      <Screen>
        <View className="flex-row items-center gap-3 px-[24px] h-14">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" className="w-10 h-10 rounded-full bg-surface-container-low items-center justify-center">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Pressable>
          <Text accessibilityRole="header" className="text-[24px] leading-8 font-semibold text-on-surface">Student detail</Text>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-8" showsVerticalScrollIndicator={false}>
          <Card variant="hero" className="mb-6">
            <Text className="text-[24px] leading-8 font-semibold text-white">{student?.name}</Text>
            <Text className="font-body-sm text-body-sm text-[#b6c2d2]">
              {student?.level} · last active {friendlyDate(student?.last_active)}
            </Text>
          </Card>

          <View className="flex-row gap-3 mb-6">
            {[
              { label: 'Avg score', value: `${student?.average_score ?? 0}%` },
              { label: 'Attempts', value: student?.trend?.length ?? 0 },
            ].map((tile) => (
              <View key={tile.label} className="flex-1 bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/50">
                <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase">{tile.label}</Text>
                <Text className="text-[32px] leading-10 font-bold text-on-surface">{tile.value}</Text>
              </View>
            ))}
          </View>

          <Text accessibilityRole="header" className="text-[18px] leading-6 font-semibold text-on-surface mb-3">Recommendations</Text>
          <Card variant="flat" className="mb-6">
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {student && student.average_score < 60
                ? `${student.name.split(' ')[0]} is struggling — consider assigning extra Trigonometry practice.`
                : 'No special interventions needed right now. 🎉'}
            </Text>
          </Card>

          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Send encouragement"
            className="bg-primary rounded-2xl h-12 items-center justify-center flex-row gap-2"
          >
            <MaterialIcon name="star" size={18} color="white" />
            <Text className="font-label-sm text-label-sm text-on-primary">Send encouragement</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    </View>
  );
}

function useLocalSearchParamsRouter() {
  const { useLocalSearchParams } = require('expo-router');
  return useLocalSearchParams();
}
