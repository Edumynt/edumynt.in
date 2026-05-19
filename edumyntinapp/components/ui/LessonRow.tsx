import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { LessonSummary } from '@/lib/api';
import { Chip } from './Chip';

interface LessonRowProps {
  lesson: LessonSummary;
  index: number;
}

export function LessonRow({ lesson, index }: LessonRowProps) {
  return (
    <Link href={`/lesson/${lesson.id}`} asChild>
      <Pressable className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-50">
          <Text className="font-black text-brand-600">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-black text-ink" numberOfLines={2}>{lesson.title}</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            <Chip tone="muted">{lesson.type}</Chip>
            {lesson.estimatedTime ? <Chip tone="leaf">{lesson.estimatedTime}</Chip> : null}
          </View>
        </View>
        <FontAwesome name="angle-right" size={22} color="#17203366" />
      </Pressable>
    </Link>
  );
}
