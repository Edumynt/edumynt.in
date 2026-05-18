import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ============================================================
// Shared field definitions (DRY — single source of truth)
// ============================================================

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: imageSchema.optional(),
  canonical: z.string().url().optional(),
  noIndex: z.boolean().default(false),
});

// ============================================================
// Course Collection (index.mdx in course root)
// ============================================================

const courseSchema = z.object({
  // Identity
  title: z.string().min(1, 'Course title is required'),
  slug: z.string().optional(), // Auto-generated from folder name if not provided

  // Descriptions
  description: z.string().min(1, 'Short description is required'),
  longDescription: z.string().optional(), // Full markdown description

  // Categorization
  category: z.string().default('uncategorized'),
  tags: z.array(z.string()).default([]),

  // Course metadata
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  duration: z.string().optional(), // e.g. "12 weeks"
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),

  // Instructor
  instructor: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  }).optional(),

  // Media
  image: imageSchema.optional(),
  coverImage: imageSchema.optional(),

  // Display order
  order: z.number().default(0),
  featured: z.boolean().default(false),

  // Status
  status: z.enum(['draft', 'published', 'archived']).default('published'),

  // SEO
  seo: seoSchema.optional(),
});

// ============================================================
// Chapter Collection (index.mdx in chapter folder)
// ============================================================

const chapterSchema = z.object({
  // Identity
  title: z.string().min(1, 'Chapter title is required'),
  slug: z.string().optional(),

  // Descriptions
  description: z.string().optional(),

  // Chapter metadata
  order: z.number().default(0),
  estimatedTime: z.string().optional(), // e.g. "45 min"

  // Media
  image: imageSchema.optional(),

  // Status
  status: z.enum(['draft', 'published', 'archived']).default('published'),

  // SEO
  seo: seoSchema.optional(),
});

// ============================================================
// Lesson Collection (individual .mdx files)
// ============================================================

const lessonSchema = z.object({
  // Identity
  title: z.string().min(1, 'Lesson title is required'),
  slug: z.string().optional(),

  // Descriptions
  description: z.string().optional(),
  excerpt: z.string().optional(), // Short preview text

  // Categorization
  tags: z.array(z.string()).default([]),

  // Lesson metadata
  order: z.number().default(0),
  estimatedTime: z.string().optional(), // e.g. "15 min"
  type: z.enum(['lesson', 'quiz', 'assignment', 'resource']).default('lesson'),

  // Authors
  author: z.string().optional(),
  contributors: z.array(z.string()).default([]),

  // Dates
  date: z.date().optional(),
  updated: z.date().optional(),

  // Media
  image: imageSchema.optional(),
  coverImage: imageSchema.optional(),

  // Display
  featured: z.boolean().default(false),

  // Status
  status: z.enum(['draft', 'published', 'archived']).default('published'),

  // SEO
  seo: seoSchema.optional(),
});

// ============================================================
// Collection Definitions
// ============================================================

const courses = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/courses' }),
  schema: courseSchema,
});

const chapters = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/courses' }),
  schema: chapterSchema,
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/courses' }),
  schema: lessonSchema,
});

export const collections = {
  courses,
  chapters,
  lessons,
};

// ============================================================
// Type Exports (for use in .astro files)
// ============================================================

export type Course = z.infer<typeof courseSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
