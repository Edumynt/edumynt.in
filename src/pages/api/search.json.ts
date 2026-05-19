import type { APIRoute } from 'astro';
import { jsonResponse, searchPayload } from '../../lib/api-data';

export const GET: APIRoute = async ({ site }) => {
  return jsonResponse(await searchPayload(site));
};
