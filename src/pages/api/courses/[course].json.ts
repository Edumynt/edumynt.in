import type { APIRoute, GetStaticPaths } from 'astro';
import { fullCoursePayload, jsonResponse } from '../../../lib/api-data';
import { getCourseOutlines, type CourseOutline } from '../../../lib/course-data';

export const getStaticPaths: GetStaticPaths = async () => {
  const outlines = await getCourseOutlines();

  return outlines.map(outline => ({
    params: { course: outline.courseId },
    props: { outline },
  }));
};

export const GET: APIRoute<{ outline: CourseOutline }> = async ({ props, site }) => {
  return jsonResponse(await fullCoursePayload(props.outline, site));
};
