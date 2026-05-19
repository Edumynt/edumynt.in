import type { APIRoute } from 'astro';
import { apiMeta, courseSummary, jsonResponse } from '../../lib/api-data';
import { getCourseOutlines } from '../../lib/course-data';

export const GET: APIRoute = async ({ site }) => {
  const outlines = await getCourseOutlines();

  return jsonResponse({
    ...apiMeta(site),
    count: outlines.length,
    courses: outlines.map(outline => courseSummary(outline, site)),
  });
};
