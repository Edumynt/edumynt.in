import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { getSearchIndex, type SearchPayload } from '@/lib/api';

export default function SearchScreen() {
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setPayload(await getSearchIndex());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load search.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!payload) return [];
    if (!normalized) return payload.items.slice(0, 20);
    return payload.items.filter(item => [
      item.title,
      item.description,
      item.type,
      ...(item.tags || []),
    ].filter(Boolean).join(' ').toLowerCase().includes(normalized)).slice(0, 40);
  }, [payload, query]);

  if (loading) return <StateView title="Loading search" message="Preparing the index." icon="search" />;
  if (error || !payload) return <StateView title="Search unavailable" message={error || 'Try again.'} actionLabel="Retry" onAction={load} icon="warning" />;

  return (
    <Screen contentClassName="pt-4">
      <Text className="text-4xl font-black text-ink">Search</Text>
      <View className="mt-5 flex-row items-center gap-3 rounded-3xl bg-white px-4 py-3">
        <FontAwesome name="search" size={18} color="#17203388" />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses and lessons"
          placeholderTextColor="#17203366"
          className="flex-1 text-base font-semibold text-ink"
        />
      </View>

      <View className="mt-6 gap-3">
        {results.map(item => {
          const href = item.type === 'course'
            ? `/course/${item.id}`
            : `/lesson/${item.id}`;
          return (
            <Link key={`${item.type}-${item.id}`} href={href as any} asChild>
              <Pressable className="rounded-3xl bg-white p-4">
                <Text className="text-xs font-black uppercase tracking-[2px] text-brand-600">{item.type}</Text>
                <Text className="mt-2 text-lg font-black text-ink">{item.title}</Text>
                {item.description ? <Text className="mt-1 text-sm leading-5 text-ink/55" numberOfLines={2}>{item.description}</Text> : null}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </Screen>
  );
}
