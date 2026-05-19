import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { Chip } from '@/components/ui/Chip';
import { LessonRow } from '@/components/ui/LessonRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { getCourse, type CourseDetail } from '@/lib/api';
import { rememberCourse } from '@/lib/storage';

type Tab = 'curriculum' | 'overview' | 'details';

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tab, setTab] = useState<Tab>('curriculum');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!courseId) return;
    try {
      setError(null);
      const data = await getCourse(courseId);
      setCourse(data);
      await rememberCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load course.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [courseId]);

  const firstLessonHref = useMemo(() => course?.firstLesson ? `/lesson/${course.firstLesson.id}` : undefined, [course]);

  if (loading) return <StateView title="Loading course" message="Preparing chapters and lessons." icon="book" />;
  if (error || !course) return <StateView title="Could not load course" message={error || 'Try again.'} actionLabel="Retry" onAction={load} icon="warning" />;

  return (
    <Screen contentClassName="pt-2">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white">
          <FontAwesome name="angle-left" size={26} color="#172033" />
        </Pressable>
        {firstLessonHref ? (
          <Pressable onPress={() => router.push(firstLessonHref as any)} className="rounded-2xl bg-ink px-4 py-3">
            <Text className="font-black text-white">Start</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="rounded-[34px] bg-white p-5 shadow-card">
        <View className="flex-row flex-wrap gap-2">
          <Chip tone="brand">{`${course.stats.chapterCount} chapters`}</Chip>
          <Chip tone="leaf">{`${course.stats.lessonCount} lessons`}</Chip>
          <Chip>{course.difficulty}</Chip>
        </View>
        <Text className="mt-4 text-4xl font-black leading-[44px] text-ink">{course.title}</Text>
        <Text className="mt-3 text-base leading-6 text-ink/60">{course.description}</Text>
      </View>

      <View className="mt-5 flex-row rounded-3xl bg-white p-1">
        {(['curriculum', 'overview', 'details'] as Tab[]).map(item => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            className={`flex-1 rounded-2xl px-3 py-3 ${tab === item ? 'bg-brand-500' : ''}`}
          >
            <Text className={`text-center text-sm font-black capitalize ${tab === item ? 'text-white' : 'text-ink/55'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'curriculum' ? (
        <View>
          <SectionHeader title="Chapters and lessons" detail={`${course.stats.lessonCount} lessons`} />
          {course.chapters.map(chapter => (
            <View key={chapter.id} className="mb-5">
              <View className="mb-3 rounded-3xl bg-ink p-4">
                <Text className="text-xs font-black uppercase tracking-[2px] text-brand-100">
                  {chapter.lessonCount} lessons
                </Text>
                <Text className="mt-1 text-xl font-black text-white">{chapter.title}</Text>
                {chapter.description ? <Text className="mt-2 text-sm leading-5 text-white/65">{chapter.description}</Text> : null}
              </View>
              {chapter.lessons.map((lesson, index) => (
                <LessonRow key={lesson.id} lesson={lesson} index={index} />
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'overview' ? (
        <View className="mt-6 rounded-[28px] bg-white p-5">
          <Markdown style={markdownStyles}>{course.content.markdown || course.longDescription || course.description}</Markdown>
        </View>
      ) : null}

      {tab === 'details' ? (
        <View className="mt-6 gap-4">
          <View className="rounded-[28px] bg-white p-5">
            <Text className="text-lg font-black text-ink">Exam focus</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {course.exams.length ? course.exams.map(exam => <Chip key={exam} tone="brand">{exam}</Chip>) : <Chip>General</Chip>}
            </View>
          </View>
          {course.learningOutcomes.length ? (
            <View className="rounded-[28px] bg-white p-5">
              <Text className="text-lg font-black text-ink">Learning outcomes</Text>
              {course.learningOutcomes.map(outcome => (
                <Text key={outcome} className="mt-3 text-base leading-6 text-ink/65">• {outcome}</Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const markdownStyles = {
  body: { color: '#172033', fontSize: 16, lineHeight: 25 },
  heading1: { color: '#172033', fontSize: 28, fontWeight: '900' as const },
  heading2: { color: '#172033', fontSize: 23, fontWeight: '900' as const, marginTop: 18 },
  paragraph: { color: '#172033cc', lineHeight: 25 },
  list_item: { color: '#172033cc' },
};
