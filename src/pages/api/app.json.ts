import type { APIRoute } from 'astro';
import { appShellPayload, jsonResponse } from '../../lib/api-data';

export const GET: APIRoute = async ({ site }) => {
  return jsonResponse(await appShellPayload(site));
};
