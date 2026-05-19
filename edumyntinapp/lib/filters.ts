import type { CourseOutline } from './api';

export function allExams(courses: CourseOutline[]) {
  return [...new Set(courses.flatMap(course => course.exams))].sort((a, b) => a.localeCompare(b));
}

export function filterCourses(courses: CourseOutline[], query: string, selectedExam?: string, selectedDifficulty?: string) {
  const normalized = query.trim().toLowerCase();

  return courses.filter(course => {
    const matchesQuery = !normalized || [
      course.title,
      course.description,
      course.category,
      ...course.tags,
      ...course.exams,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalized);
    const matchesExam = !selectedExam || course.exams.includes(selectedExam);
    const matchesDifficulty = !selectedDifficulty || course.difficulty === selectedDifficulty;

    return matchesQuery && matchesExam && matchesDifficulty;
  });
}
