import type { APIRoute } from 'astro';
import { apiMeta, appShellPayload, jsonResponse } from '../../lib/api-data';

export const GET: APIRoute = async ({ site }) => {
  const app = await appShellPayload(site);

  return jsonResponse({
    ...apiMeta(site),
    name: 'Edumynt API',
    description: 'Static JSON API for Edumynt courses, chapters, lessons, and search.',
    counts: app.counts,
    endpoints: app.endpoints,
  });
};
