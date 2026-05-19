import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { CourseCard } from '@/components/ui/CourseCard';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { getCourses, type CourseOutline } from '@/lib/api';
import { allExams, filterCourses } from '@/lib/filters';

const difficulties = ['beginner', 'intermediate', 'advanced'];

export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseOutline[]>([]);
  const [query, setQuery] = useState('');
  const [exam, setExam] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setError(null);
      setCourses(await getCourses());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load courses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const exams = useMemo(() => allExams(courses), [courses]);
  const visibleCourses = useMemo(() => filterCourses(courses, query, exam, difficulty), [courses, query, exam, difficulty]);

  if (loading) return <StateView title="Loading courses" message="Fetching the course library." icon="book" />;
  if (error) return <StateView title="Could not load courses" message={error} actionLabel="Retry" onAction={load} icon="warning" />;

  return (
    <Screen contentClassName="pt-4">
      <Text className="text-4xl font-black text-ink">Courses</Text>
      <Text className="mt-2 text-base text-ink/60">Find a course by exam, level, or title.</Text>

      <View className="mt-5 flex-row items-center gap-3 rounded-3xl bg-white px-4 py-3">
        <FontAwesome name="search" size={18} color="#17203388" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses"
          placeholderTextColor="#17203366"
          className="flex-1 text-base font-semibold text-ink"
        />
      </View>

      <SectionHeader eyebrow="Filters" title="Exam focus" />
      <View className="flex-row flex-wrap gap-2">
        <Pressable onPress={() => setExam(undefined)}>
          <Chip tone={!exam ? 'brand' : 'muted'}>All</Chip>
        </Pressable>
        {exams.map(item => (
          <Pressable key={item} onPress={() => setExam(exam === item ? undefined : item)}>
            <Chip tone={exam === item ? 'brand' : 'muted'}>{item}</Chip>
          </Pressable>
        ))}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <Pressable onPress={() => setDifficulty(undefined)}>
          <Chip tone={!difficulty ? 'leaf' : 'muted'}>Any level</Chip>
        </Pressable>
        {difficulties.map(item => (
          <Pressable key={item} onPress={() => setDifficulty(difficulty === item ? undefined : item)}>
            <Chip tone={difficulty === item ? 'leaf' : 'muted'}>{item}</Chip>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Available courses" detail={`${visibleCourses.length} found`} />
      <View className="gap-5">
        {visibleCourses.map(course => <CourseCard key={course.id} course={course} />)}
      </View>
    </Screen>
  );
}
