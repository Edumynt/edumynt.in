import { getCollection, type CollectionEntry } from 'astro:content';

export type CourseEntry = CollectionEntry<'courses'>;
export type ChapterEntry = CollectionEntry<'chapters'>;
export type LessonEntry = CollectionEntry<'lessons'>;

export interface CourseStats {
  chapterCount: number;
  lessonCount: number;
  estimatedTime?: string;
}

export interface ChapterOutline {
  chapter: ChapterEntry;
  courseId: string;
  chapterId: string;
  lessons: LessonEntry[];
  lessonCount: number;
  estimatedTime?: string;
}

export interface CourseOutline {
  course: CourseEntry;
  courseId: string;
  chapters: ChapterOutline[];
  lessons: LessonEntry[];
  stats: CourseStats;
  firstLesson?: LessonEntry;
}

export interface LessonContext {
  course: CourseEntry;
  chapter?: ChapterEntry;
  lesson: LessonEntry;
  courseId: string;
  chapterId: string;
  lessonId: string;
  courseLessons: LessonEntry[];
  previousLesson?: LessonEntry;
  nextLesson?: LessonEntry;
  lessonIndex: number;
  totalLessons: number;
}

type ContentEntry = CourseEntry | ChapterEntry | LessonEntry;

function isPublished(entry: ContentEntry) {
  return entry.data.status === 'published';
}

function compareByOrderTitleId<T extends { id: string; data: { order?: number; title: string } }>(a: T, b: T) {
  const orderDiff = (a.data.order ?? 0) - (b.data.order ?? 0);
  if (orderDiff !== 0) return orderDiff;

  const titleDiff = a.data.title.localeCompare(b.data.title, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  if (titleDiff !== 0) return titleDiff;

  return a.id.localeCompare(b.id, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function getCourseId(id: string) {
  return id.split('/')[0] ?? '';
}

export function getChapterId(id: string) {
  return id.split('/')[1] ?? '';
}

export function getLessonId(id: string) {
  const parts = id.split('/');
  return parts[parts.length - 1] ?? '';
}

export function courseUrl(courseOrId: CourseEntry | string) {
  const courseId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id;
  return `/courses/${courseId}`;
}

export function lessonUrl(lessonOrId: LessonEntry | string) {
  const lessonId = typeof lessonOrId === 'string' ? lessonOrId : lessonOrId.id;
  return `/courses/${lessonId}`;
}

export function cleanDisplayName(value: string) {
  return value
    .replace(/^\d+[\s\-_]+/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

export function getImageSrc(entry: CourseEntry | LessonEntry) {
  return entry.data.image?.src || entry.data.coverImage?.src || '/images/course_placeholder.jpg';
}

export function getImageAlt(entry: CourseEntry | LessonEntry) {
  return entry.data.image?.alt || entry.data.coverImage?.alt || entry.data.title;
}

export async function getPublishedContent() {
  const [courses, chapters, lessons] = await Promise.all([
    getCollection('courses'),
    getCollection('chapters'),
    getCollection('lessons'),
  ]);

  return {
    courses: courses.filter(isPublished).sort(compareByOrderTitleId),
    chapters: chapters.filter(isPublished).sort(compareByOrderTitleId),
    lessons: lessons.filter(isPublished).sort(compareByOrderTitleId),
  };
}

function sortLessonsByCourseOutline(lessons: LessonEntry[], chapters: ChapterEntry[]) {
  const chapterRank = new Map(
    chapters.map((chapter, index) => [
      getChapterId(chapter.id),
      {
        index,
        order: chapter.data.order ?? 0,
        title: chapter.data.title,
      },
    ])
  );

  return [...lessons].sort((a, b) => {
    const aChapter = chapterRank.get(getChapterId(a.id));
    const bChapter = chapterRank.get(getChapterId(b.id));

    const chapterOrderDiff = (aChapter?.order ?? 0) - (bChapter?.order ?? 0);
    if (chapterOrderDiff !== 0) return chapterOrderDiff;

    const chapterIndexDiff = (aChapter?.index ?? Number.MAX_SAFE_INTEGER) - (bChapter?.index ?? Number.MAX_SAFE_INTEGER);
    if (chapterIndexDiff !== 0) return chapterIndexDiff;

    const chapterTitleDiff = (aChapter?.title ?? getChapterId(a.id)).localeCompare(
      bChapter?.title ?? getChapterId(b.id),
      undefined,
      { numeric: true, sensitivity: 'base' }
    );
    if (chapterTitleDiff !== 0) return chapterTitleDiff;

    return compareByOrderTitleId(a, b);
  });
}

export function buildCourseOutline(
  course: CourseEntry,
  allChapters: ChapterEntry[],
  allLessons: LessonEntry[]
): CourseOutline {
  const courseId = course.id;
  const chapters = allChapters
    .filter(chapter => getCourseId(chapter.id) === courseId)
    .sort(compareByOrderTitleId);

  const lessons = sortLessonsByCourseOutline(
    allLessons.filter(lesson => getCourseId(lesson.id) === courseId),
    chapters
  );

  const chapterOutlines = chapters.map(chapter => {
    const chapterId = getChapterId(chapter.id);
    const chapterLessons = lessons.filter(lesson => getChapterId(lesson.id) === chapterId);

    return {
      chapter,
      courseId,
      chapterId,
      lessons: chapterLessons,
      lessonCount: chapterLessons.length,
      estimatedTime: chapter.data.estimatedTime,
    };
  });

  return {
    course,
    courseId,
    chapters: chapterOutlines,
    lessons,
    firstLesson: lessons[0],
    stats: {
      chapterCount: chapters.length,
      lessonCount: lessons.length,
      estimatedTime: course.data.duration,
    },
  };
}

export async function getCourseOutlines() {
  const { courses, chapters, lessons } = await getPublishedContent();
  return courses.map(course => buildCourseOutline(course, chapters, lessons));
}

export async function getCourseOutline(courseId: string) {
  const { courses, chapters, lessons } = await getPublishedContent();
  const course = courses.find(item => item.id === courseId);
  return course ? buildCourseOutline(course, chapters, lessons) : undefined;
}

export async function getLessonContexts() {
  const { courses, chapters, lessons } = await getPublishedContent();
  const outlines = courses.map(course => buildCourseOutline(course, chapters, lessons));
  const courseById = new Map(courses.map(course => [course.id, course]));
  const chapterById = new Map(chapters.map(chapter => [chapter.id, chapter]));

  return lessons
    .map(lesson => {
      const courseId = getCourseId(lesson.id);
      const chapterId = getChapterId(lesson.id);
      const lessonId = getLessonId(lesson.id);
      const course = courseById.get(courseId);
      const chapter = chapterById.get(`${courseId}/${chapterId}`);
      const outline = outlines.find(item => item.courseId === courseId);

      if (!course || !outline || !chapterId || !lessonId) return undefined;

      const lessonIndex = outline.lessons.findIndex(item => item.id === lesson.id);

      return {
        course,
        chapter,
        lesson,
        courseId,
        chapterId,
        lessonId,
        courseLessons: outline.lessons,
        previousLesson: lessonIndex > 0 ? outline.lessons[lessonIndex - 1] : undefined,
        nextLesson: lessonIndex >= 0 ? outline.lessons[lessonIndex + 1] : undefined,
        lessonIndex,
        totalLessons: outline.lessons.length,
      } satisfies LessonContext;
    })
    .filter((context): context is LessonContext => Boolean(context));
}
