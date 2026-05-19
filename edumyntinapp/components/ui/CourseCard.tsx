import { Link } from 'expo-router';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import type { CourseOutline, CourseSummary } from '@/lib/api';
import { rememberCourse } from '@/lib/storage';
import { Chip } from './Chip';

interface CourseCardProps {
  course: CourseOutline | CourseSummary;
  compact?: boolean;
}

export function CourseCard({ course, compact = false }: CourseCardProps) {
  const imageUrl = course.image?.url || course.coverImage?.url || course.image?.src;

  return (
    <Link href={`/course/${course.id}`} asChild>
      <Pressable
        onPress={() => void rememberCourse(course)}
        className={`overflow-hidden rounded-[28px] bg-white shadow-card ${compact ? 'w-72' : 'w-full'}`}
      >
        <ImageBackground source={imageUrl ? { uri: imageUrl } : undefined} className={compact ? 'h-40' : 'h-48'}>
          <View className="flex-1 justify-end bg-black/35 p-4">
            <Text className="text-xl font-black leading-6 text-white" numberOfLines={2}>
              {course.title}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <Chip tone="dark">{course.difficulty}</Chip>
              {course.duration ? <Chip tone="dark">{course.duration}</Chip> : null}
              {course.featured ? <Chip tone="brand">Featured</Chip> : null}
            </View>
          </View>
        </ImageBackground>
        <View className="p-4">
          <Text className="text-sm leading-5 text-ink/65" numberOfLines={compact ? 2 : 3}>
            {course.description}
          </Text>
          <View className="mt-4 flex-row items-center justify-between border-t border-ink/10 pt-4">
            <Text className="text-xs font-bold text-ink/50">
              {course.stats.chapterCount} chapters · {course.stats.lessonCount} lessons
            </Text>
            <Text className="text-sm font-black text-brand-600">Open</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
