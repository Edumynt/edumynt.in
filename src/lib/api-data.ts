import { render } from 'astro:content';
import {
  courseUrl,
  getChapterId,
  getCourseOutlines,
  getImageAlt,
  getImageSrc,
  getLessonContexts,
  lessonUrl,
  type ChapterOutline,
  type CourseEntry,
  type CourseOutline,
  type LessonContext,
  type LessonEntry,
} from './course-data';

export const API_VERSION = '1.0.0';

type SiteUrl = URL | string | undefined;

export interface ApiContext {
  site?: SiteUrl;
}

export function absoluteUrl(path: string | undefined, site?: SiteUrl) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  const base = site ? site.toString() : 'https://edumynt.in';
  return new URL(path, base).toString();
}

function isoDate(value: Date | string | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function imagePayload(entry: CourseEntry | LessonEntry, site?: SiteUrl) {
  const image = entry.data.image || entry.data.coverImage;

  return {
    src: getImageSrc(entry),
    url: absoluteUrl(getImageSrc(entry), site),
    alt: getImageAlt(entry),
    caption: image?.caption,
  };
}

function seoPayload(seo: CourseEntry['data']['seo'] | LessonEntry['data']['seo'] | undefined, site?: SiteUrl) {
  if (!seo) return undefined;

  return {
    ...seo,
    image: seo.image
      ? {
          ...seo.image,
          url: absoluteUrl(seo.image.src, site),
        }
      : undefined,
  };
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json; charset=utf-8',
      ...init?.headers,
    },
  });
}

export function apiMeta(site?: SiteUrl) {
  return {
    apiVersion: API_VERSION,
    generatedAt: new Date().toISOString(),
    site: absoluteUrl('/', site),
  };
}

export function courseSummary(outline: CourseOutline, site?: SiteUrl) {
  const { course, stats } = outline;

  return {
    id: outline.courseId,
    slug: course.data.slug || outline.courseId,
    title: course.data.title,
    description: course.data.description,
    category: course.data.category,
    tags: course.data.tags,
    exams: course.data.exams,
    difficulty: course.data.difficulty,
    duration: course.data.duration,
    featured: course.data.featured,
    order: course.data.order,
    version: course.data.version,
    image: imagePayload(course, site),
    coverImage: course.data.coverImage
      ? {
          ...course.data.coverImage,
          url: absoluteUrl(course.data.coverImage.src, site),
        }
      : undefined,
    url: courseUrl(course),
    absoluteUrl: absoluteUrl(courseUrl(course), site),
    apiUrl: `/api/courses/${outline.courseId}.json`,
    absoluteApiUrl: absoluteUrl(`/api/courses/${outline.courseId}.json`, site),
    stats,
    firstLesson: outline.firstLesson ? lessonSummary(outline.firstLesson, site) : undefined,
  };
}

export function chapterSummary(chapterOutline: ChapterOutline, site?: SiteUrl) {
  const { chapter } = chapterOutline;

  return {
    id: chapter.id,
    courseId: chapterOutline.courseId,
    chapterId: chapterOutline.chapterId,
    slug: chapter.data.slug || chapterOutline.chapterId,
    title: chapter.data.title,
    description: chapter.data.description,
    category: chapter.data.category,
    tags: chapter.data.tags,
    order: chapter.data.order,
    estimatedTime: chapter.data.estimatedTime,
    lessonCount: chapterOutline.lessonCount,
    version: chapter.data.version,
    apiUrl: `/api/courses/${chapterOutline.courseId}.json`,
    absoluteApiUrl: absoluteUrl(`/api/courses/${chapterOutline.courseId}.json`, site),
  };
}

export function lessonSummary(lesson: LessonEntry, site?: SiteUrl, context?: LessonContext) {
  const courseId = context?.courseId || lesson.id.split('/')[0] || '';
  const chapterId = context?.chapterId || getChapterId(lesson.id);

  return {
    id: lesson.id,
    courseId,
    chapterId,
    lessonId: context?.lessonId || lesson.id.split('/').at(-1) || '',
    slug: lesson.data.slug || lesson.id.split('/').at(-1) || '',
    title: lesson.data.title,
    description: lesson.data.description,
    excerpt: lesson.data.excerpt,
    category: lesson.data.category,
    tags: lesson.data.tags,
    type: lesson.data.type,
    difficulty: lesson.data.difficulty,
    estimatedTime: lesson.data.estimatedTime,
    featured: lesson.data.featured,
    order: lesson.data.order,
    date: isoDate(lesson.data.date),
    updated: isoDate(lesson.data.updated),
    version: lesson.data.version,
    image: imagePayload(lesson, site),
    url: lessonUrl(lesson),
    absoluteUrl: absoluteUrl(lessonUrl(lesson), site),
    apiUrl: `/api/lessons/${lesson.id}.json`,
    absoluteApiUrl: absoluteUrl(`/api/lessons/${lesson.id}.json`, site),
  };
}

export function courseOutlinePayload(outline: CourseOutline, site?: SiteUrl) {
  return {
    ...courseSummary(outline, site),
    chapters: outline.chapters.map(chapter => ({
      ...chapterSummary(chapter, site),
      lessons: chapter.lessons.map(lesson => lessonSummary(lesson, site)),
    })),
  };
}

export async function fullCoursePayload(outline: CourseOutline, site?: SiteUrl) {
  const { headings } = await render(outline.course);

  return {
    ...courseOutlinePayload(outline, site),
    longDescription: outline.course.data.longDescription,
    prerequisites: outline.course.data.prerequisites,
    learningOutcomes: outline.course.data.learningOutcomes,
    instructors: outline.course.data.instructors,
    videoPreview: outline.course.data.videoPreview,
    seo: seoPayload(outline.course.data.seo, site),
    content: {
      format: 'mdx',
      markdown: outline.course.body || '',
      headings,
    },
  };
}

export async function fullLessonPayload(context: LessonContext, site?: SiteUrl) {
  const { headings } = await render(context.lesson);
  const outline = (await getCourseOutlines()).find(item => item.courseId === context.courseId);

  return {
    ...lessonSummary(context.lesson, site, context),
    course: outline ? courseSummary(outline, site) : undefined,
    chapter: context.chapter
      ? {
          id: context.chapter.id,
          courseId: context.courseId,
          chapterId: context.chapterId,
          slug: context.chapter.data.slug || context.chapterId,
          title: context.chapter.data.title,
          description: context.chapter.data.description,
          order: context.chapter.data.order,
          estimatedTime: context.chapter.data.estimatedTime,
        }
      : undefined,
    navigation: {
      previousLesson: context.previousLesson ? lessonSummary(context.previousLesson, site) : undefined,
      nextLesson: context.nextLesson ? lessonSummary(context.nextLesson, site) : undefined,
      lessonIndex: context.lessonIndex,
      lessonNumber: context.lessonIndex + 1,
      totalLessons: context.totalLessons,
      progressPercent: context.totalLessons > 0 ? Math.round(((context.lessonIndex + 1) / context.totalLessons) * 100) : 0,
    },
    author: context.lesson.data.author,
    contributors: context.lesson.data.contributors,
    instructors: context.lesson.data.instructors,
    seo: seoPayload(context.lesson.data.seo, site),
    content: {
      format: 'mdx',
      markdown: context.lesson.body || '',
      headings,
    },
  };
}

export async function appShellPayload(site?: SiteUrl) {
  const outlines = await getCourseOutlines();

  return {
    ...apiMeta(site),
    counts: {
      courses: outlines.length,
      chapters: outlines.reduce((total, outline) => total + outline.chapters.length, 0),
      lessons: outlines.reduce((total, outline) => total + outline.lessons.length, 0),
    },
    endpoints: {
      manifest: '/api/index.json',
      app: '/api/app.json',
      courses: '/api/courses.json',
      search: '/api/search.json',
      course: '/api/courses/{courseId}.json',
      lesson: '/api/lessons/{courseId}/{chapterId}/{lessonId}.json',
    },
    courses: outlines.map(outline => courseOutlinePayload(outline, site)),
  };
}

export async function searchPayload(site?: SiteUrl) {
  const [outlines, contexts] = await Promise.all([getCourseOutlines(), getLessonContexts()]);

  return {
    ...apiMeta(site),
    items: [
      ...outlines.map(outline => ({
        id: outline.courseId,
        type: 'course',
        title: outline.course.data.title,
        description: outline.course.data.description,
        tags: outline.course.data.tags,
        url: courseUrl(outline.course),
        apiUrl: `/api/courses/${outline.courseId}.json`,
        absoluteUrl: absoluteUrl(courseUrl(outline.course), site),
      })),
      ...contexts.map(context => ({
        id: context.lesson.id,
        type: 'lesson',
        courseId: context.courseId,
        chapterId: context.chapterId,
        title: context.lesson.data.title,
        description: context.lesson.data.description || context.lesson.data.excerpt || context.course.data.title,
        tags: context.lesson.data.tags,
        url: lessonUrl(context.lesson),
        apiUrl: `/api/lessons/${context.lesson.id}.json`,
        absoluteUrl: absoluteUrl(lessonUrl(context.lesson), site),
      })),
    ],
  };
}
