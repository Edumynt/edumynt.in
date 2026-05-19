import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { CourseCard } from '@/components/ui/CourseCard';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { getAppShell, type AppShell } from '@/lib/api';
import { getLessonProgress, getRecentCourses, type LessonProgress, type RecentCourse } from '@/lib/storage';

export default function HomeScreen() {
  const [data, setData] = useState<AppShell | null>(null);
  const [recents, setRecents] = useState<RecentCourse[]>([]);
  const [progress, setProgress] = useState<LessonProgress>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [app, recentCourses, lessonProgress] = await Promise.all([
        getAppShell(),
        getRecentCourses(),
        getLessonProgress(),
      ]);
      setData(app);
      setRecents(recentCourses);
      setProgress(lessonProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Edumynt.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(useCallback(() => {
    void Promise.all([getRecentCourses(), getLessonProgress()]).then(([recentCourses, lessonProgress]) => {
      setRecents(recentCourses);
      setProgress(lessonProgress);
    });
  }, []));

  if (loading) {
    return <StateView title="Loading Edumynt" message="Preparing your courses." icon="leaf" />;
  }

  if (error || !data) {
    return <StateView title="Could not load" message={error || 'Try again.'} actionLabel="Retry" onAction={load} icon="warning" />;
  }

  const recentCourses = recents
    .map(recent => data.courses.find(course => course.id === recent.id))
    .filter(Boolean)
    .slice(0, 3);
  const publishedCourses = data.courses.slice(0, 3);
  const activeProgress = Object.values(progress)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  return (
    <Screen contentClassName="pt-4">
      <LinearGradient colors={['#172033', '#3d775f']} className="overflow-hidden rounded-[34px] p-6">
        <Text className="text-sm font-black uppercase tracking-[3px] text-brand-100">Edumynt</Text>
        <Text className="mt-3 text-4xl font-black leading-[44px] text-white">Literature learning, structured for exams.</Text>
        <Text className="mt-3 text-base leading-6 text-white/75">
          {data.counts.courses} courses · {data.counts.chapters} chapters · {data.counts.lessons} lessons
        </Text>
        <Link href="/courses" asChild>
          <Pressable className="mt-6 flex-row items-center self-start rounded-2xl bg-brand-500 px-5 py-3">
            <Text className="font-black text-white">Browse courses</Text>
            <FontAwesome name="angle-right" size={18} color="#fff" style={{ marginLeft: 10 }} />
          </Pressable>
        </Link>
      </LinearGradient>

      {activeProgress ? (
        <>
          <SectionHeader eyebrow="Continue" title="Last lesson" />
          <Link href={`/lesson/${activeProgress.lessonPath}` as any} asChild>
            <Pressable className="rounded-[28px] bg-white p-5 shadow-card">
              <Text className="text-xs font-black uppercase tracking-[2px] text-brand-600">{activeProgress.courseTitle}</Text>
              <Text className="mt-2 text-xl font-black text-ink">{activeProgress.lessonTitle}</Text>
              <View className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
                <View className="h-full rounded-full bg-brand-500" style={{ width: `${activeProgress.progressPercent}%` }} />
              </View>
              <Text className="mt-2 text-sm font-bold text-ink/50">
                Lesson {activeProgress.lessonNumber} of {activeProgress.totalLessons}
              </Text>
            </Pressable>
          </Link>
        </>
      ) : null}

      <SectionHeader eyebrow="Recent" title="Recently accessed" detail={recentCourses.length ? `${recentCourses.length}/3` : undefined} />
      {recentCourses.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pr-5">
          {recentCourses.map(course => course ? <CourseCard key={course.id} course={course} compact /> : null)}
        </ScrollView>
      ) : (
        <View className="rounded-[28px] border border-dashed border-ink/15 bg-white/50 p-6">
          <Text className="text-center font-bold text-ink/50">Open a course once and it will appear here.</Text>
        </View>
      )}

      <SectionHeader eyebrow="Published" title="Recently published courses" detail="3 shown" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pr-5">
        {publishedCourses.map(course => <CourseCard key={course.id} course={course} compact />)}
      </ScrollView>
    </Screen>
  );
}
