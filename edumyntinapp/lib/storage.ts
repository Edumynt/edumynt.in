import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CourseSummary, LessonDetail } from './api';

const RECENTS_KEY = 'edumynt:recentCourses';
const PROGRESS_KEY = 'edumynt:lessonProgress';

export interface RecentCourse {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  timestamp: string;
}

export interface LessonProgress {
  [courseId: string]: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonPath: string;
    lessonNumber: number;
    totalLessons: number;
    progressPercent: number;
    updatedAt: string;
    visitedLessons: string[];
  };
}

export async function getRecentCourses() {
  const raw = await AsyncStorage.getItem(RECENTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as RecentCourse[] : [];
  } catch {
    await AsyncStorage.removeItem(RECENTS_KEY);
    return [];
  }
}

export async function rememberCourse(course: Pick<CourseSummary, 'id' | 'title' | 'description' | 'image'>) {
  const current = await getRecentCourses();
  const next: RecentCourse[] = [
    {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.image?.url || course.image?.src,
      timestamp: new Date().toISOString(),
    },
    ...current.filter(item => item.id !== course.id),
  ].slice(0, 8);

  await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  return next;
}

export async function getLessonProgress(): Promise<LessonProgress> {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as LessonProgress : {};
  } catch {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    return {};
  }
}

export async function rememberLesson(lesson: LessonDetail) {
  const current = await getLessonProgress();
  const previous = current[lesson.courseId];
  const visitedLessons = previous?.visitedLessons?.includes(lesson.id)
    ? previous.visitedLessons
    : [...(previous?.visitedLessons || []), lesson.id];

  const next = {
    ...current,
    [lesson.courseId]: {
      courseId: lesson.courseId,
      courseTitle: lesson.course?.title || lesson.courseId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonPath: lesson.id,
      lessonNumber: lesson.navigation.lessonNumber,
      totalLessons: lesson.navigation.totalLessons,
      progressPercent: lesson.navigation.progressPercent,
      updatedAt: new Date().toISOString(),
      visitedLessons,
    },
  };

  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  return next;
}
