# Edumynt Coding Principles & Architecture Guide

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [SOLID Principles](#solid-principles)
3. [KISS & DRY](#kiss--dry)
4. [File Organization Rules](#file-organization-rules)
5. [Component Design](#component-design)
6. [Content Architecture](#content-architecture)
7. [Type Safety with Zod](#type-safety-with-zod)
8. [Naming Conventions](#naming-conventions)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Core Philosophy

Every file, function, and component should have **one clear reason to change**. If you can't describe what a file does in one sentence, it's doing too much.

> "The ratio of time spent reading versus writing is well over 10 to 1. We are constantly reading old code as part of the effort of writing new code." — Robert C. Martin

**Priority:** Readability > Cleverness > Brevity

---

## SOLID Principles

### S — Single Responsibility Principle

Each file/module should have exactly one job.

**✅ Good:**
```
src/lib/course-utils.ts      → Course data transformations only
src/lib/chapter-utils.ts     → Chapter data transformations only
src/lib/seo.ts               → SEO meta tag generation only
src/components/Head.astro    → <head> element only
```

**❌ Bad:**
```
src/lib/utils.ts             → Button variants + card variants + date formatting + SEO
src/components/Navigation.astro → Nav + settings drawer + theme toggle + progress tracking
```

### O — Open/Closed Principle

Modules should be open for extension, closed for modification.

**✅ Good:** Use configuration objects and props to extend behavior:
```typescript
// Extend via props, not by modifying the component
interface CardProps {
  variant: 'default' | 'interactive' | 'outline';
  size: 'sm' | 'md' | 'lg';
}
```

**❌ Bad:** Adding `if` statements for every new use case inside a component.

### L — Liskov Substitution Principle

Collections and types should be interchangeable where their parent type is expected.

**✅ Good:** All collections return consistent shapes via Zod schemas.

### I — Interface Segregation Principle

Don't force consumers to depend on interfaces they don't use.

**✅ Good:** Separate schemas for separate concerns:
```typescript
const courseSchema = z.object({ /* course fields only */ });
const chapterSchema = z.object({ /* chapter fields only */ });
const lessonSchema = z.object({ /* lesson fields only */ });
```

**❌ Bad:** One giant `contentSchema` with optional fields for everything.

### D — Dependency Inversion Principle

Depend on abstractions (types, interfaces), not concrete implementations.

**✅ Good:**
```typescript
// Depend on the type, not the data source
async function getCourses(): Promise<Course[]> { ... }
```

---

## KISS & DRY

### KISS (Keep It Simple, Stupid)

- Prefer explicit code over clever one-liners
- If a function needs comments to explain what it does, simplify it
- Use early returns instead of deep nesting
- Prefer `if/else` over complex ternary chains

**✅ Good:**
```typescript
function getCourseSlug(course: Course): string {
  return course.slug ?? course.title.toLowerCase().replace(/\s+/g, '-');
}
```

**❌ Bad:**
```typescript
const slug = c?.slug || c?.title?.toLowerCase().replace(/\s+/g, '-') || c?.data?.course?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'untitled';
```

### DRY (Don't Repeat Yourself)

- Shared logic → extract to `src/lib/`
- Shared types → extract to `src/lib/types.ts`
- Shared UI patterns → extract to `src/components/`
- Shared frontmatter fields → extract to schema helpers in `src/content.config.ts`

**But:** DRY doesn't mean "copy-paste is always wrong." Two similar-looking things that change for different reasons should stay separate.

---

## File Organization Rules

### Directory Structure

```
src/
├── components/           # UI components (pure presentation)
│   ├── layout/           # Layout components (Header, Footer, Sidebar)
│   ├── course/           # Course-specific components
│   └── ui/               # Generic reusable UI (Button, Card, Badge)
├── content/              # Content collections (MDX files)
│   └── courses/
│       ├── index.mdx     # Course-level metadata
│       └── {chapter}/
│           ├── index.mdx # Chapter-level metadata
│           └── *.mdx     # Lesson files
├── layouts/              # Astro page layouts
│   ├── BaseLayout.astro  # HTML shell, <head>, <body>
│   ├── CourseLayout.astro # Course page structure
│   └── LessonLayout.astro # Lesson reader structure
├── lib/                  # Business logic (pure functions)
│   ├── course-utils.ts   # Course data helpers
│   ├── chapter-utils.ts  # Chapter data helpers
│   ├── seo.ts            # SEO helpers
│   └── types.ts          # Shared TypeScript types
├── pages/                # Route pages (thin, delegate to layouts)
│   ├── index.astro
│   └── courses/
│       ├── index.astro
│       └── [course]/
│           ├── index.astro
│           └── [...slug].astro
└── styles/
    └── global.css        # Tailwind imports + CSS custom properties
```

### File Size Limits

| File Type | Max Lines | Action When Exceeded |
|-----------|-----------|---------------------|
| Components | 150 | Split into sub-components |
| Pages | 100 | Move logic to lib/ or layouts |
| Lib modules | 200 | Split by responsibility |
| Schemas | 100 | Split into sub-schemas |

### Import Order

```typescript
// 1. External imports
import { defineCollection, z } from 'astro:content';

// 2. Internal lib imports
import { formatDate } from '../lib/date-utils';

// 3. Component imports
import Card from '../components/ui/Card.astro';

// 4. Style imports
import '../styles/global.css';
```

---

## Component Design

### Astro Components

**Rules:**
1. Frontmatter (---) = data fetching + computation only
2. Template (HTML) = presentation only
3. Scripts (<script>) = minimal client-side interactivity
4. Styles (<style>) = scoped to component only, prefer Tailwind

**Template:**
```astro
---
// 1. Props interface
export interface Props {
  title: string;
  description?: string;
  courses: Course[];
}

// 2. Data fetching (top-level await)
const { title } = Astro.props;

// 3. Computed values (pure transformations)
const sortedCourses = courses.sort((a, b) => a.order - b.order);
---

<!-- 4. Template (no complex logic) -->
<Layout title={title}>
  <CourseGrid courses={sortedCourses} />
</Layout>
```

### Component Props

- Use TypeScript interfaces for all props
- Provide defaults for optional props
- Use discriminated unions for variant props
- Keep prop count ≤ 7 (extract to objects if more)

**✅ Good:**
```typescript
interface Props {
  course: Course;
  showDescription?: boolean;
  variant: 'card' | 'list' | 'compact';
}
```

---

## Content Architecture

### Three-Tier Content Model

```
Course (index.mdx in course root)
  └── Chapter (index.mdx in chapter folder)
        └── Lesson (*.mdx files)
```

### Course `index.mdx`

Defines course-level metadata. Lives at `src/content/courses/{course-name}/index.mdx`.

```yaml
---
title: "Indian Writers"
description: "A comprehensive study of major Indian authors"
category: "literature"
level: intermediate
duration: "12 weeks"
tags: ["indian-writers", "english-literature", "ugc-net"]
image:
  src: "/images/courses/indian-writers.jpg"
  alt: "Indian Writers course cover"
instructor:
  name: "Prof. Sharma"
  bio: "Literature professor with 20 years of experience"
prerequisites:
  - "Basic understanding of English literature"
learningOutcomes:
  - "Analyze major works of Indian literature"
  - "Understand historical and cultural contexts"
order: 1
featured: true
status: published
---
```

### Chapter `index.mdx`

Defines chapter-level metadata. Lives at `src/content/courses/{course-name}/{chapter}/index.mdx`.

```yaml
---
title: "Rabindranath Tagore"
description: "Life, works, and literary contributions of Rabindranath Tagore"
order: 1
estimatedTime: "3 hours"
image:
  src: "/images/chapters/tagore.jpg"
  alt: "Portrait of Rabindranath Tagore"
status: published
---
```

### Lesson `*.mdx`

Defines lesson content and metadata. Lives alongside chapter index.mdx.

```yaml
---
title: "Biography of Rabindranath Tagore"
description: "Comprehensive biography covering early life, education, career, and legacy"
order: 1
estimatedTime: "45 min"
tags: ["biography", "tagore", "indian-writers"]
type: lesson
author: "Prof. Sharma"
date: 2024-01-15
status: published
---

# Biography of Rabindranath Tagore

Content goes here...
```

### Frontmatter Schema Design Principles

1. **Required fields are minimal:** Only `title` is required. Everything else has sensible defaults.
2. **Use enums for fixed sets:** `status: draft | published | archived` instead of free-text strings.
3. **Group related fields:** `image: { src, alt, caption }` instead of `imageSrc`, `imageAlt`.
4. **Use arrays for lists:** `tags: string[]`, `prerequisites: string[]`.
5. **Separate SEO:** Keep `seo: { title, description, image }` as an optional nested object.
6. **Timestamps:** Use `date` (published) and `updated` (last modified) as separate fields.

---

## Type Safety with Zod

### Schema Definition

All content schemas are defined in `src/content.config.ts`. Zod provides:

1. **Runtime validation** — catches bad content at build time
2. **Type inference** — `z.infer<typeof schema>` gives TypeScript types
3. **Default values** — `.default()` ensures missing fields have values
4. **Coercion** — Zod auto-converts strings to dates, numbers, etc.

### Using Zod Types in Components

```typescript
import type { Course, Chapter, Lesson } from '../content.config';

interface Props {
  course: Course;
  chapters: Chapter[];
}
```

### Schema Best Practices

1. **Define shared sub-schemas once:**
```typescript
const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});
```

2. **Use `.optional()` for non-critical fields**

3. **Use `.default()` for fields that should always have a value:**
```typescript
status: z.enum(['draft', 'published', 'archived']).default('published'),
order: z.number().default(0),
```

4. **Use `.min()`, `.max()`, `.url()` for validation:**
```typescript
title: z.string().min(1, 'Title is required'),
canonical: z.string().url().optional(),
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CourseCard.astro` |
| Layouts | PascalCase + "Layout" | `BaseLayout.astro` |
| Lib modules | camelCase | `course-utils.ts` |
| Types | camelCase | `course-types.ts` |
| Pages | kebab-case or `index.astro` | `[course]/index.astro` |
| Content | `index.mdx` or kebab-case | `course-overview.mdx` |

### Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Constants | UPPER_SNAKE | `MAX_COURSES_PER_PAGE` |
| Variables | camelCase | `courseList` |
| Functions | camelCase, verb prefix | `getCourses()`, `formatDate()` |
| Components | PascalCase | `CourseCard` |
| Props interfaces | Props suffix | `CourseCardProps` |
| Type aliases | PascalCase | `CourseStatus` |
| Enums | PascalCase | `CourseLevel` |

### CSS Classes

- Use Tailwind utility classes directly
- For custom components, use BEM-like naming: `course-card`, `course-card__title`
- Never use inline styles unless dynamic (and even then, use CSS variables)

---

## Anti-Patterns to Avoid

### ❌ God Files

```typescript
// BAD: 500-line utils.ts with unrelated functions
export function formatDate() { ... }
export function getCourses() { ... }
export function buildSEO() { ... }
export function trackProgress() { ... }
export function sendEmail() { ... }

// GOOD: Split by responsibility
// src/lib/date-utils.ts
// src/lib/course-utils.ts
// src/lib/seo.ts
// src/lib/progress.ts
```

### ❌ Logic in Templates

```astro
<!-- BAD: Complex logic in template -->
{courses.filter(c => c.data.status === 'published').sort((a,b) => a.data.order - b.data.order).map(c => <CourseCard course={c} />)}

<!-- GOOD: Compute in frontmatter, render in template -->
---
const publishedCourses = courses
  .filter(c => c.data.status === 'published')
  .sort((a, b) => a.data.order - b.data.order);
---
{publishedCourses.map(c => <CourseCard course={c} />)}
```

### ❌ Prop Drilling

```astro
<!-- BAD: Passing props through 4 levels -->
<App course={course} chapter={chapter} lesson={chapter} user={user}>
  <Layout course={course} chapter={chapter} lesson={lesson} user={user}>
    <Sidebar course={course} chapter={chapter} lesson={lesson} user={user}>
```

### ❌ Mixed Concerns

```typescript
// BAD: Component that fetches data, transforms it, AND renders UI
---
const response = await fetch('/api/courses');
const data = await response.json();
const courses = data.map(c => ({ ...c, slug: c.title.replace(/\s/g, '-') }));
---

<!-- GOOD: Fetch in lib/, transform in frontmatter, render in template -->
---
import { getCourses } from '../lib/course-utils';
const courses = await getCourses();
---
```

### ❌ Magic Strings

```typescript
// BAD
if (course.data.status === 'published') { ... }
if (course.data.level === 'intermediate') { ... }

// GOOD: Use constants or the Zod enum
import { CourseStatus, CourseLevel } from '../lib/types';
if (course.data.status === CourseStatus.PUBLISHED) { ... }
```

### ❌ Over-Abstraction

Don't create abstractions for things that are used once. A helper function should be used at least twice before extraction.

---

## Summary Checklist

Before committing code, verify:

- [ ] Each file has a single, clear responsibility
- [ ] No file exceeds the line limit for its type
- [ ] All props have TypeScript interfaces
- [ ] Content schemas use Zod with proper validation
- [ ] No logic in templates (only in frontmatter or lib/)
- [ ] No magic strings (use constants/enums)
- [ ] Imports follow the correct order
- [ ] Naming conventions are consistent
- [ ] No unused imports or variables
- [ ] Build passes (`npm run build`)
