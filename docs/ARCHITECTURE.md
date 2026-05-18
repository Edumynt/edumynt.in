# Edumynt Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Content System](#content-system)
5. [Routing](#routing)
6. [Components](#components)
7. [Mindmap System](#mindmap-system)
8. [Theme System](#theme-system)
9. [PWA](#pwa)
10. [Build & Deploy](#build--deploy)
11. [Design Tokens](#design-tokens)

---

## Overview

Edumynt is a **course-based learning application** built with Astro. It organizes educational content (literature courses) into a hierarchical structure: **Courses → Chapters → Lessons**. Each lesson is an MDX file with frontmatter metadata. The app features interactive mindmaps, MCQ quizzes, progress tracking, dark/light theming, and PWA support.

**Key characteristics:**
- Static site generation (SSG) via Astro
- Content-driven architecture using Astro Content Collections
- Client-side interactivity via React islands (MCQ) and vanilla JS (mindmap, theme, progress)
- Mobile-first responsive design with bottom navigation
- localStorage-based progress tracking (no backend)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5.12.4 |
| Styling | Tailwind CSS 3.4 + CSS Custom Properties |
| Content | MDX (Markdown + JSX) via `@astrojs/mdx` |
| UI Components | Custom Astro components + React islands |
| Icons | Lucide React (MCQ), inline SVG (everything else) |
| PWA | `vite-plugin-pwa` with Workbox |
| Fonts | Inter (sans), Source Serif 4 (serif) via Google Fonts |
| CI/CD | GitHub Actions → GitHub Pages |
| Node | 20+ |

---

## Project Structure

```
edumynt.in/
├── .github/workflows/deploy.yml    # CI/CD: build + deploy to GitHub Pages
├── public/
│   ├── CNAME                      # Custom domain: edumynt.in
│   ├── .nojekyll                  # Prevent GitHub Pages from ignoring _ dirs
│   ├── favicon.svg
│   ├── manifest.json              # PWA manifest
│   ├── icons/                     # PWA icons (72px to 512px)
│   └── images/
│       └── course_placeholder.jpg # Fallback course image
├── src/
│   ├── components/
│   │   ├── Head.astro            # Shared <head> with fonts, theme, meta
│   │   ├── Navigation.astro       # Bottom nav bar + settings drawer
│   │   ├── mindmap/
│   │   │   ├── MindmapViewer.astro  # Standalone mindmap component
│   │   │   └── MindmapModal.astro   # Full-screen mindmap modal
│   │   └── ui/
│   │       ├── Button.astro       # shadcn-style button (CVA variants)
│   │       ├── Card.astro         # shadcn-style card
│   │       ├── Sheet.astro        # Slide-over panel
│   │       ├── MCQBlock.tsx       # React island: full MCQ quiz block
│   │       └── SimpleMCQ.tsx      # React island: wrapper with sample data
│   ├── content/
│   │   ├── config.ts              # Collection schema definition
│   │   └── courses/               # All course content (MDX files)
│   │       ├── doubt-solving/
│   │       ├── indian-writers/
│   │       ├── literary-movements/
│   │       ├── literary-periods/
│   │       ├── literary-terms-mh-abraham/
│   │       └── teaching-methods/
│   ├── lib/
│   │   ├── mindmap/               # Full mindmap engine (7 files)
│   │   │   ├── types.ts           # TypeScript interfaces
│   │   │   ├── parser.ts          # MDX → mindmap tree parser
│   │   │   ├── layout.ts          # Node positioning engine
│   │   │   ├── renderer.ts        # SVG renderer
│   │   │   ├── controller.ts      # Main orchestrator class
│   │   │   ├── search.ts          # Search engine for mindmap nodes
│   │   │   ├── touch-gestures.ts  # Touch/pan/zoom gesture handler
│   │   │   ├── progress-tracker.ts # Per-lesson mindmap progress
│   │   │   └── content-loader.ts  # Load mindmap from content collection
│   │   ├── theme-manager.ts       # Dark/light theme toggle + transition
│   │   ├── theme-color.ts         # PWA status bar color updater
│   │   ├── pwa.ts                 # Service worker registration
│   │   └── utils.ts               # cn(), buttonVariants, cardVariants
│   ├── pages/
│   │   ├── index.astro            # Homepage: course carousel
│   │   └── courses/
│   │       ├── index.astro        # All courses grid
│   │       ├── [course]/
│   │       │   ├── index.astro    # Course detail: chapter/lesson list
│   │       │   └── [...slug].astro # Lesson reader page
│   └── styles/
│       └── global.css             # Tailwind + CSS custom properties
├── astro.config.mjs               # Astro config (MDX, Tailwind, PWA)
├── tailwind.config.mjs            # Tailwind theme extensions
├── components.json                # shadcn/ui configuration
├── tsconfig.json                  # TypeScript config
└── package.json
```

---

## Content System

### Collection Schema

Defined in `src/content/config.ts`:

```typescript
{
  title: string           // Required - Lesson title
  description?: string    // Optional - Meta description
  course: string          // Required - Course name (e.g. "Indian Writers")
  chapter?: string        // Optional - Chapter slug (e.g. "rabindranath-tagore")
  order?: number          // Optional - Sort order within chapter
  tags?: string[]         // Optional - Tags for categorization
  author?: string         // Optional - Author name
  date?: Date             // Optional - Publication date
  draft: boolean          // Optional - Draft flag (default: false)
  image?: string          // Optional - Course/lesson image URL
}
```

### Content Organization

Content is organized by **folder structure**, not by frontmatter alone:

```
src/content/courses/{course-name}/{chapter-folder}/{lesson-file}.mdx
```

**Example:**
```
indian-writers/
├── 0 introduction/
│   ├── course-overview.mdx     # order: 0
│   ├── indian-writers-syllabus.mdx
│   └── ...
├── rabindranath-tagore/
│   ├── 1_Biography.mdx         # order: 1
│   ├── 2_Works_and_Awards.mdx  # order: 2
│   ├── 4_Literary_Style_and_Themes.mdx
│   ├── 5_Mindmap.mdx           # Bullet-point mindmap content
│   └── 6_Practice_MCQs.mdx     # MCQ quiz content
├── rk-narayan/
│   ├── 1_Biography.mdx
│   └── ...
```

### How Content Drives Routing

The `course` frontmatter field is the **primary grouping key**. All lessons with the same `course` value belong to the same course, regardless of which folder they're in. The folder name becomes the `chapter` slug.

**Course slug generation:** `courseName.toLowerCase().replace(/\s+/g, '-')`
- "Indian Writers" → `indian-writers`
- "Literary Terms By MH Abraham" → `literary-terms-by-mh-abraham`

### Lesson Types (by convention)

| Type | Naming Pattern | Purpose |
|------|---------------|---------|
| Overview | `course-overview.mdx` | Course introduction |
| Biography | `1_Biography.mdx` | Author biography |
| Works | `2_Works_and_Awards.mdx` | Major works list |
| Style | `4_Literary_Style_and_Themes.mdx` | Literary analysis |
| Mindmap | `5_Mindmap.mdx` | Bullet-point summary for mindmap |
| MCQs | `6_Practice_MCQs.mdx` | Practice questions |

### Mindmap Content Format

Mindmap files use a specific bullet-point structure that the parser understands:

```markdown
- **Rabindranath Tagore (1861-1941)**
  - **Titles & Epithets**
    - Gurudev
    - The Bard of Bengal
  - **Biography**
    - **Born:** May 7, 1861
    - **Education**
      - Primarily at home
      - University College London
```

The parser (`src/lib/mindmap/parser.ts`) converts this into a tree structure:
- Top-level bullets → root node
- Indented bullets → child nodes
- Bold text → node titles
- Indentation depth → node level

---

## Routing

### Route Map

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Homepage with course carousel |
| `/courses` | `src/pages/courses/index.astro` | All courses grid |
| `/courses/:course` | `src/pages/courses/[course]/index.astro` | Course detail page |
| `/courses/:course/:slug` | `src/pages/courses/[course]/[...slug].astro` | Lesson reader |

### Route Details

#### `/` — Homepage
- Fetches all courses via `getCollection('courses')`
- Groups by `course` field, counts lessons/chapters
- Displays course carousel with auto-slide, touch swipe
- "Continue Learning" section (localStorage-based)
- Bottom nav: Home (active), Courses, Tests, Settings

#### `/courses` — Course Listing
- Grid layout (1/2/3 columns responsive)
- Cards with placeholder image, title, description, chapter/lesson counts
- Hover effects with scale and shadow

#### `/courses/:course` — Course Detail
- `getStaticPaths()`: generates one path per unique `course` value
- Builds hierarchical lesson tree from folder structure
- Collapsible chapter sections with lesson counts
- Roman numeral chapter numbering
- Progress tracking per lesson (visited/completed via localStorage)
- Auto-scroll to last visited lesson (via `sessionStorage`)

#### `/courses/:course/:slug` — Lesson Reader
- `getStaticPaths()`: generates one path per lesson (using `[...slug]` catch-all)
- Renders MDX content via `lesson.render()`
- Fixed header with back button, progress bar, theme toggle
- Breadcrumb navigation
- Previous/Next lesson navigation
- Scroll-based progress tracking
- Tag display, date display
- "Next Lesson" button at bottom (or "Course Complete!")

---

## Components

### Head.astro
Shared `<head>` element used by all pages. Includes:
- UTF-8 charset, favicon, PWA manifest
- Viewport (no zoom for app-like feel)
- Google Fonts (Inter + Source Serif 4)
- Theme color meta tags (light/dark)
- iOS PWA meta tags
- Inline script to prevent FOUC (flash of unstyled content)
- Dynamic title and description via props

### Navigation.astro
Two-part navigation system:

**Bottom Nav Bar** (fixed, 4 tabs):
- Home (`/`) — active state when `pageType === 'home'`
- Courses (`/courses`) — active when `pageType === 'courses'` or `'course'`
- Tests — placeholder button (no route yet)
- Settings — opens settings drawer

**Settings Drawer** (slide-in from right):
- Dark mode toggle
- Uses ThemeManager for animated theme transitions

**Props:** `pageType: 'home' | 'courses' | 'course' | 'lesson'`

### UI Components (shadcn-style)

All use `class-variance-authority` (CVA) for variant management via `src/lib/utils.ts`.

**Button.astro** — Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. Renders as `<a>` if `href` provided, else `<button>`.

**Card.astro** — Variants: `default`, `interactive`, `outline`. Sizes: `default`, `sm`, `lg`.

**Sheet.astro** — Slide-over panel with backdrop. Controlled via `open` prop.

### React Islands

**MCQBlock.tsx** — Full-featured MCQ quiz component:
- Accepts `questions: MCQQuestion[]` prop
- Per-question state: selected answer, show answer, show explanation, show hint
- Visual feedback: green for correct, red for incorrect
- Progress bar and stats (total/answered/correct/accuracy)
- Hint and reset buttons per question
- Summary section with gradient background

**SimpleMCQ.tsx** — Wrapper with sample data (placeholder).

### Mindmap Components

**MindmapViewer.astro** — Standalone mindmap viewer:
- SVG-based rendering with zoom/pan/expand controls
- Touch gesture support (pinch-to-zoom, pan, tap, long-press)
- Loading and error states
- Mobile-optimized control buttons

**MindmapModal.astro** — Full-screen mindmap modal:
- Search bar with results dropdown
- Fullscreen toggle
- Export and reset view buttons
- Node count and depth info in footer

---

## Mindmap System

The mindmap system is a **custom-built, client-side interactive visualization engine** (7 TypeScript files, ~2000 lines).

### Architecture

```
ContentLoader → Parser → LayoutEngine → Renderer
                                    ↑
                              Controller ← TouchGestures
                                    ↑
                              SearchEngine
                                    ↑
                              ProgressTracker
```

### Data Flow

1. **ContentLoader** finds mindmap content (looks for `5_Mindmap.mdx` files or auto-generates from headings)
2. **Parser** converts bullet-point MDX into a `MindmapNode` tree
3. **LayoutEngine** calculates node positions (vertical tree or radial layout)
4. **Renderer** draws SVG elements (nodes as rounded rects, connections as curved paths)
5. **Controller** orchestrates everything, handles user interactions
6. **TouchGestures** handles mobile interactions (pinch, pan, tap, long-press, momentum)
7. **SearchEngine** provides full-text search across all nodes
8. **ProgressTracker** tracks visited nodes per lesson (localStorage)

### Key Types

```typescript
interface MindmapNode {
  id: string
  title: string
  content?: string
  level: number
  children: MindmapNode[]
  parent?: MindmapNode
  isCollapsed: boolean
  position: { x: number; y: number }
  dimensions: { width: number; height: number }
  metadata?: {
    type?: 'root' | 'branch' | 'leaf'
    importance?: 'high' | 'medium' | 'low'
    tags?: string[]
  }
}
```

### Layout Algorithm

- **Radial layout**: Used for root with ≤4 children (mobile-friendly)
- **Vertical tree layout**: Used for complex hierarchies
- Node spacing: 80-120px horizontal, 60-80px vertical
- Auto-collapse: Nodes beyond level 2 are collapsed by default

---

## Theme System

### CSS Custom Properties

Light and dark themes via CSS custom properties on `:root` and `.dark`:

| Property | Light | Dark |
|----------|-------|------|
| `--background` | 0 0% 100% (white) | 222.2 84% 4.9% (dark navy) |
| `--foreground` | 222.2 84% 4.9% (dark) | 210 40% 98% (light) |
| `--primary` | 222.2 47.4% 11.2% (dark blue) | 210 40% 98% (light) |
| `--muted` | 210 40% 96% (light gray) | 217.2 32.6% 17.5% (dark gray) |
| `--border` | 214.3 31.8% 91.4% | 217.2 32.6% 17.5% |

### ThemeManager Class

- Persists theme to `localStorage` (key: `theme`)
- Listens for system preference changes
- Animated theme transition (ripple effect from toggle button)
- Dispatches `theme-color` meta tag updates for PWA status bar

---

## PWA

Configured via `vite-plugin-pwa` in `astro.config.mjs`:

- **Manifest**: App name "Edumynt - Literature Study App", standalone display
- **Icons**: 72px through 512px
- **Service Worker**: Auto-update with update banner
- **Runtime Caching**: Google Fonts (CacheFirst, 1 year)
- **Offline**: Service worker caches all static assets

---

## Build & Deploy

### Build Command
```bash
npm run build
```
Output: `./dist/` directory

### Deploy Workflow (GitHub Actions)
1. Trigger: push to `main` branch
2. Uses `withastro/action@v3` to build and upload
3. Deploys to GitHub Pages via `actions/deploy-pages@v4`
4. Custom domain: `edumynt.in` (via `public/CNAME`)

### Environment
- GitHub Pages environment with branch policy protection
- Deployment from `gh-pages` branch

---

## Design Tokens

### Typography
- **Sans**: Inter (300-800 weights) — used for UI, headings (`font-display`)
- **Serif**: Source Serif 4 — used for body text (`font-serif`)
- **Base size**: 16px, line-height: 1.7
- **Heading scale**: h1=4xl-6xl, h2=3xl-5xl, h3=2xl-4xl, h4=xl-3xl

### Spacing & Layout
- Max width: `max-w-7xl` (1280px) for main containers
- Lesson content: `max-w-4xl` (896px)
- Card padding: `p-6` (default), `p-4` (sm), `p-8` (lg)
- Gap: `gap-6` for grids, `gap-4` for flex

### Border Radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-md` (6px)
- Mindmap nodes: `rx: 8, ry: 8`
- Settings drawer: `rounded-l-2xl` (16px)

### Shadows
- Cards: `shadow-sm` → `shadow-lg` on hover
- Mindmap root: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`

### Animations
- Theme transition: 0.3s ease
- Carousel slide: 300ms ease-in-out
- Mindmap viewport: 0.2s ease
- Page transitions: fadeIn, slideIn, slideUp (0.3s)

---

## Current Content Stats

| Course | Chapters | Lessons |
|--------|----------|---------|
| Indian Writers | 15 | 158 |
| Literary Terms By MH Abraham | 5 | 107 |
| Teaching Methods | 12 | 22 |
| Doubt Solving | 2 | 3 |
| Literary Movements | 1 | 11 |
| Literary Periods | 1 | 9 |
| **Total** | **36** | **310** |

---

## Known Limitations & Technical Debt

1. **Tests tab** — Bottom nav has a "Tests" button but no route/page exists
2. **MCQ data** — MCQBlock expects structured data but content uses raw markdown `<details>` tags; no parsing bridge exists
3. **Mindmap auto-generation** — Falls back to extracting headings from lesson content, but quality varies
4. **No search** — No site-wide search functionality
5. **No i18n** — Content includes Hindi translations in `<details>` tags but no formal i18n system
6. **Progress tracking** — Two separate systems: one for courses (localStorage key `edumynt_course_progress`) and one for mindmaps (key `mindmap_progress_{lessonId}`)
7. **No pagination** — All courses/lessons loaded at once (could be slow with large content)
8. **Console logs** — Debug console.log statements left in production code
