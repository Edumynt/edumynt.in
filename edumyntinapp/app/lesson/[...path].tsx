import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/Chip';
import { StateView } from '@/components/ui/StateView';
import { getLesson, type LessonDetail } from '@/lib/api';
import { rememberLesson } from '@/lib/storage';

export default function LessonScreen() {
  const { path } = useLocalSearchParams<{ path?: string[] | string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lessonPath = useMemo(() => Array.isArray(path) ? path.join('/') : path || '', [path]);

  async function load() {
    if (!lessonPath) return;
    try {
      setError(null);
      const data = await getLesson(lessonPath);
      setLesson(data);
      await rememberLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lesson.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [lessonPath]);

  if (loading) return <StateView title="Loading lesson" message="Opening the reader." icon="file-text" />;
  if (error || !lesson) return <StateView title="Could not load lesson" message={error || 'Try again.'} actionLabel="Retry" onAction={load} icon="warning" />;

  const next = lesson.navigation.nextLesson;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="border-b border-ink/10 bg-paper px-5 pb-3 pt-2">
        <View className="flex-row items-center justify-between gap-4">
          <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <FontAwesome name="angle-left" size={26} color="#172033" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xs font-black uppercase tracking-[2px] text-brand-600" numberOfLines={1}>
              {lesson.course?.title || lesson.courseId}
            </Text>
            <Text className="mt-1 text-sm font-bold text-ink/55">
              Lesson {lesson.navigation.lessonNumber} of {lesson.navigation.totalLessons}
            </Text>
          </View>
        </View>
        <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <View className="h-full rounded-full bg-brand-500" style={{ width: `${lesson.navigation.progressPercent}%` }} />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2">
          <Chip tone="brand">{lesson.type}</Chip>
          <Chip tone="leaf">{lesson.difficulty}</Chip>
          {lesson.estimatedTime ? <Chip>{lesson.estimatedTime}</Chip> : null}
        </View>
        <Text className="mt-4 text-4xl font-black leading-[44px] text-ink">{lesson.title}</Text>
        {lesson.description ? <Text className="mt-3 text-base leading-6 text-ink/60">{lesson.description}</Text> : null}

        <View className="mt-8">
          <Markdown style={markdownStyles}>{lesson.content.markdown}</Markdown>
        </View>

        {next ? (
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              router.push(`/lesson/${next.id}` as any);
            }}
            className="mt-8 flex-row items-center justify-between rounded-[28px] bg-ink p-5"
          >
            <View className="flex-1 pr-4">
              <Text className="text-xs font-black uppercase tracking-[2px] text-brand-100">Next lesson</Text>
              <Text className="mt-2 text-xl font-black text-white">{next.title}</Text>
            </View>
            <FontAwesome name="angle-right" size={28} color="#fff" />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push(`/course/${lesson.courseId}` as any)} className="mt-8 rounded-[28px] bg-white p-5">
            <Text className="text-center text-base font-black text-ink">Back to course</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: { color: '#172033', fontSize: 17, lineHeight: 28 },
  heading1: { color: '#172033', fontSize: 30, fontWeight: '900' as const, marginBottom: 12 },
  heading2: { color: '#172033', fontSize: 24, fontWeight: '900' as const, marginTop: 22 },
  heading3: { color: '#172033', fontSize: 20, fontWeight: '900' as const, marginTop: 18 },
  paragraph: { color: '#172033dd', lineHeight: 28, marginBottom: 12 },
  bullet_list: { marginBottom: 12 },
  ordered_list: { marginBottom: 12 },
  list_item: { color: '#172033dd', lineHeight: 26 },
  blockquote: { backgroundColor: '#fffaf0', borderLeftColor: '#d98422', borderLeftWidth: 4, paddingLeft: 14 },
  strong: { fontWeight: '900' as const, color: '#172033' },
};
