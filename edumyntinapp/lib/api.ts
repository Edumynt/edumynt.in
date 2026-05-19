import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

export const API_BASE = process.env.EXPO_PUBLIC_EDUMYNT_API_BASE || 'https://edumynt.in';

const imageSchema = z.object({
  src: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
}).passthrough();

export const lessonSummarySchema = z.object({
  id: z.string(),
  courseId: z.string(),
  chapterId: z.string(),
  lessonId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().default('lesson'),
  difficulty: z.string().default('intermediate'),
  estimatedTime: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  image: imageSchema.optional(),
  url: z.string(),
  absoluteUrl: z.string().optional(),
  apiUrl: z.string(),
  absoluteApiUrl: z.string().optional(),
}).passthrough();

export const courseSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  exams: z.array(z.string()).default([]),
  difficulty: z.string().default('intermediate'),
  duration: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().optional(),
  image: imageSchema.optional(),
  coverImage: imageSchema.optional(),
  url: z.string(),
  absoluteUrl: z.string().optional(),
  apiUrl: z.string(),
  absoluteApiUrl: z.string().optional(),
  stats: z.object({
    chapterCount: z.number(),
    lessonCount: z.number(),
    estimatedTime: z.string().optional(),
  }),
  firstLesson: lessonSummarySchema.optional(),
}).passthrough();

export const chapterSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  chapterId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  order: z.number().optional(),
  estimatedTime: z.string().optional(),
  lessonCount: z.number(),
  lessons: z.array(lessonSummarySchema).default([]),
}).passthrough();

export const courseOutlineSchema = courseSummarySchema.extend({
  chapters: z.array(chapterSchema).default([]),
});

export const appShellSchema = z.object({
  apiVersion: z.string(),
  generatedAt: z.string(),
  site: z.string().optional(),
  counts: z.object({
    courses: z.number(),
    chapters: z.number(),
    lessons: z.number(),
  }),
  courses: z.array(courseOutlineSchema),
}).passthrough();

export const courseDetailSchema = courseOutlineSchema.extend({
  longDescription: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  instructors: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  })).default([]),
  videoPreview: z.string().optional(),
  content: z.object({
    format: z.string(),
    markdown: z.string().default(''),
    headings: z.array(z.object({
      depth: z.number(),
      slug: z.string(),
      text: z.string(),
    }).passthrough()).default([]),
  }),
});

export const lessonDetailSchema = lessonSummarySchema.extend({
  course: courseSummarySchema.optional(),
  chapter: z.object({
    id: z.string(),
    courseId: z.string(),
    chapterId: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    estimatedTime: z.string().optional(),
  }).optional(),
  navigation: z.object({
    previousLesson: lessonSummarySchema.optional(),
    nextLesson: lessonSummarySchema.optional(),
    lessonIndex: z.number(),
    lessonNumber: z.number(),
    totalLessons: z.number(),
    progressPercent: z.number(),
  }),
  author: z.string().optional(),
  contributors: z.array(z.string()).optional(),
  instructors: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  })).default([]),
  content: z.object({
    format: z.string(),
    markdown: z.string().default(''),
    headings: z.array(z.object({
      depth: z.number(),
      slug: z.string(),
      text: z.string(),
    }).passthrough()).default([]),
  }),
});

export const searchPayloadSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    type: z.enum(['course', 'lesson']),
    courseId: z.string().optional(),
    chapterId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    url: z.string(),
    apiUrl: z.string(),
    absoluteUrl: z.string().optional(),
  }).passthrough()),
}).passthrough();

export type AppShell = z.infer<typeof appShellSchema>;
export type CourseSummary = z.infer<typeof courseSummarySchema>;
export type CourseOutline = z.infer<typeof courseOutlineSchema>;
export type CourseDetail = z.infer<typeof courseDetailSchema>;
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
export type LessonDetail = z.infer<typeof lessonDetailSchema>;
export type SearchPayload = z.infer<typeof searchPayloadSchema>;

const cacheKey = (path: string) => `edumynt:api:${path}`;

function endpoint(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchAndValidate<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const url = endpoint(path);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const parsed = schema.parse(json);
    await AsyncStorage.setItem(cacheKey(path), JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    const cached = await AsyncStorage.getItem(cacheKey(path));
    if (cached) return schema.parse(JSON.parse(cached));
    throw error;
  }
}

export function getAppShell() {
  return fetchAndValidate('/api/app.json', appShellSchema);
}

export function getCourses() {
  return getAppShell().then(data => data.courses);
}

export function getCourse(courseId: string) {
  return fetchAndValidate(`/api/courses/${courseId}.json`, courseDetailSchema);
}

export function getLesson(lessonPath: string) {
  return fetchAndValidate(`/api/lessons/${lessonPath}.json`, lessonDetailSchema);
}

export function getSearchIndex() {
  return fetchAndValidate('/api/search.json', searchPayloadSchema);
}

export function compactDescription(text?: string, fallback = '') {
  return (text || fallback).replace(/\s+/g, ' ').trim();
}
