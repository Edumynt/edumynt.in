# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edumynt is a comprehensive literature study application built with Astro, focusing on English literature courses including Indian writers, literary periods, movements, and teaching methods. It features an interactive mindmap system and progressive web app capabilities.

## Development Commands

- `npm run dev` - Start local development server at `localhost:4321`
- `npm run build` - Build production site to `./dist/`
- `npm run preview` - Preview build locally
- `npm run astro ...` - Run Astro CLI commands

## Architecture

### Core Framework
- **Astro 5.12.4**: Static site generator with islands architecture
- **MDX Integration**: Content authored in MDX files with frontmatter
- **Tailwind CSS**: Utility-first styling with custom prose classes
- **PWA Support**: Service worker and manifest for offline capability

### Content System
- **Content Collections**: Courses defined in `src/content/config.ts` with Zod schema validation
- **Hierarchical Structure**: Courses → Chapters → Lessons with automatic routing
- **Frontmatter Schema**:
  ```typescript
  {
    title: string,
    description?: string,
    course: string, // "Literary Periods", "Literary Movements", etc.
    chapter?: string, // folder name
    order?: number,
    tags?: string[],
    author?: string,
    date?: Date,
    draft?: boolean,
    image?: string
  }
  ```

### Dynamic Routing
- Course index: `/courses/[course]/index.astro`
- Lesson pages: `/courses/[course]/[...slug].astro`
- Static path generation from content collections
- Automatic breadcrumb and navigation generation

### Mindmap System
Custom interactive mindmap implementation in `src/lib/mindmap/`:
- **Parser** (`parser.ts`): Converts MDX content to hierarchical mindmap data
- **Layout Engine** (`layout.ts`): Mobile-responsive node positioning
- **SVG Renderer** (`renderer.ts`): Interactive SVG visualization
- **Touch Gestures** (`touch-gestures.ts`): Mobile interaction support
- **Types** (`types.ts`): TypeScript interfaces for mindmap data structures

Key mindmap interfaces:
- `MindmapNode`: Individual nodes with position, content, and children
- `MindmapData`: Complete mindmap with metadata
- `ViewportState`: Zoom and pan state management

### Course Progress System
Client-side progress tracking with localStorage:
- Lesson visit tracking
- Scroll-based reading progress
- Course completion state
- Last visited lesson restoration

### Theme Management
- Dark/light mode toggle in `src/lib/theme-manager.ts`
- CSS custom properties for theming
- Persistent theme preferences

## File Organization

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, etc.)
│   └── mindmap/     # Mindmap viewer components
├── content/
│   └── courses/     # Course content in MDX
├── lib/
│   ├── mindmap/     # Mindmap system modules
│   └── utils.ts     # Utility functions
├── pages/
│   ├── courses/     # Dynamic routing for courses
│   └── index.astro  # Homepage
└── styles/
    └── global.css   # Global styles and CSS custom properties
```

## Content Structure

Courses follow this pattern:
```
src/content/courses/[course-name]/
├── 0 introduction/
│   └── course-overview.mdx
└── [chapter-folders]/
    └── [lesson-files].mdx
```

## Styling Conventions

- **Tailwind Classes**: Prefer utility classes over custom CSS
- **Design Tokens**: Use CSS custom properties (`hsl(var(--primary))`)
- **Responsive Design**: Mobile-first approach with breakpoint prefixes
- **Prose Styling**: Custom prose classes for content typography
- **Component Styling**: Scoped styles in Astro components

## Important Implementation Details

1. **Static Generation**: All routes are pre-built at build time
2. **Mobile Optimization**: Mindmaps adapt to touch interactions and screen size
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Performance**: Lazy loading and efficient SVG rendering for mindmaps
5. **Accessibility**: Semantic HTML with ARIA labels for interactive elements