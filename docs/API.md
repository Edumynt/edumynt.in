# Edumynt Static API

The site builds a static JSON API under `/api`. It is safe to consume from an Expo React Native app because every endpoint is generated from the same Astro content collections used by the web UI.

Base URL:

```text
https://edumynt.in
```

## Recommended App Flow

1. Fetch `/api/app.json` on app launch for course cards, course outlines, chapter lists, lesson summaries, counts, and endpoint templates.
2. Fetch `/api/search.json` when building client-side search.
3. Fetch `/api/courses/{courseId}.json` when opening a course detail screen.
4. Fetch `/api/lessons/{courseId}/{chapterId}/{lessonId}.json` when opening a lesson reader.
5. Render lesson `content.markdown` in Expo using a Markdown/MDX-compatible renderer.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `/api/index.json` | API manifest with counts and endpoint templates. |
| `/api/app.json` | App shell payload for home, course listing, and course detail outlines. |
| `/api/courses.json` | Compact list of all published courses. |
| `/api/courses/{courseId}.json` | Full course payload with chapters, lessons, overview markdown, outcomes, and metadata. |
| `/api/lessons/{courseId}/{chapterId}/{lessonId}.json` | Full lesson payload with markdown content, headings, course/chapter context, and previous/next navigation. |
| `/api/search.json` | Search index for all published courses and lessons. |

## Example Fetches

```ts
const API_BASE = 'https://edumynt.in';

export async function getAppShell() {
  const response = await fetch(`${API_BASE}/api/app.json`);
  if (!response.ok) throw new Error('Failed to load app shell');
  return response.json();
}

export async function getLesson(courseId: string, chapterId: string, lessonId: string) {
  const response = await fetch(`${API_BASE}/api/lessons/${courseId}/${chapterId}/${lessonId}.json`);
  if (!response.ok) throw new Error('Failed to load lesson');
  return response.json();
}
```

## Payload Notes

- Only `published` content is included.
- Image payloads include both site-relative `src` and absolute `url`.
- Lessons expose `content.markdown` and `content.headings`; the API does not pre-render lesson HTML.
- Lesson payloads include `navigation.previousLesson`, `navigation.nextLesson`, `lessonNumber`, `totalLessons`, and `progressPercent`.
- All API responses include `Access-Control-Allow-Origin: *` and `Content-Type: application/json; charset=utf-8`.
