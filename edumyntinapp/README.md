# Edumynt Mobile App

Expo SDK 55 native app for Edumynt. It renders the same course structure as `edumynt.in` by consuming the Astro-generated static JSON API.

## Stack

- Expo SDK 55
- Expo Router
- React 19.2 / React Native 0.83
- NativeWind
- Zod API validation
- AsyncStorage for cache, recent courses, and lesson progress
- `react-native-markdown-display` for lesson markdown

## API

Default API base:

```text
https://edumynt.in
```

Override with:

```bash
EXPO_PUBLIC_EDUMYNT_API_BASE=http://localhost:4321 npm start
```

Important endpoints:

- `/api/app.json`: app shell, counts, courses, chapters, lesson summaries
- `/api/courses/{courseId}.json`: full course detail
- `/api/lessons/{courseId}/{chapterId}/{lessonId}.json`: full lesson markdown and navigation
- `/api/search.json`: searchable course and lesson index

## Development

```bash
npm install
npm start
npm run typecheck
npm run doctor
```

The app is committed inside the main website repo so future changes to the API and native app can be reviewed together.
