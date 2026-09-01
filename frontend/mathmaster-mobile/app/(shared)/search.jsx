import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Button from '../../src/components/ui/Button';
import Chip from '../../src/components/ui/Chip';
import EmptyState from '../../src/components/ui/EmptyState';
import Input from '../../src/components/ui/Input';
import MaterialIcon from '../../src/components/ui/MaterialIcon';
import Screen from '../../src/components/ui/Screen';
import { useTopics } from '../../src/hooks';

const RECENT = ['algebra', 'trigonometry', 'venn diagram'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data } = useTopics();
  const results = (data || []).filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View className="flex-1 bg-background" accessibilityLabel="Search">
      <Screen>
        <View className="px-[24px] pt-4 pb-3 flex-row items-center gap-3">
          <Button variant="icon" onPress={() => router.back()} accessibilityLabel="Close search">
            <MaterialIcon name="arrow_back" size={22} color="on-surface-variant" />
          </Button>
          <View className="flex-1">
            <Input label="Search topics…" value={query} onChangeText={setQuery} leftIcon="search" autoFocus accessibilityLabel="Search topics" />
          </View>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-8" keyboardShouldPersistTaps="handled">
          {query ? (
            results.length ? (
              results.map((t) => (
                <View key={t.id} className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/50 mb-2">
                  <Text className="text-[18px] leading-6 font-semibold text-on-surface">{t.name}</Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>{t.description}</Text>
                </View>
              ))
            ) : (
              <EmptyState icon="saved_search" title="No matches" description={`Nothing found for "${query}". Try a different term.`} />
            )
          ) : (
            <>
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">Recent searches</Text>
              <View className="flex-row flex-wrap gap-2">
                {RECENT.map((r) => <Chip key={r} label={r} onPress={() => setQuery(r)} />)}
              </View>
            </>
          )}
        </ScrollView>
      </Screen>
    </View>
  );
}
