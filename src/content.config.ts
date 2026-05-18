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
// Course Collection (index.mdx in course root folder)
// ============================================================

const courseSchema = z.object({
  // Identity
  title: z.string().min(1, 'Course title is required'),
  slug: z.string().optional(), // Auto-generated from folder name

  // Descriptions
  description: z.string().min(1, 'Short description is required'),
  longDescription: z.string().optional(), // Full markdown for course detail page

  // Categorization — all 3 tiers support category + tags for search/filter
  category: z.string().default('uncategorized'),
  tags: z.array(z.string()).default([]),

  // Exams — a course can belong to multiple exams
  exams: z.array(z.string()).default([]),
  // Examples: ["UGC NET", "UPSC", "PSC", "NET/JRF", "SET"]

  // Difficulty
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),

  // Course metadata
  duration: z.string().optional(), // e.g. "12 weeks"
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),

  // Instructors — multiple instructors per course
  instructors: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  })).default([{ name: 'Edumynt' }]),

  // Media
  image: imageSchema.optional(),       // Thumbnail for cards
  coverImage: imageSchema.optional(),  // Hero/banner for course page
  videoPreview: z.string().optional(), // Promo video URL (YouTube, etc.)

  // Display
  order: z.number().default(0),
  featured: z.boolean().default(false),

  // Status & versioning
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  version: z.string().default('1.0.0'),

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

  // Categorization
  category: z.string().default('uncategorized'),
  tags: z.array(z.string()).default([]),

  // Chapter metadata
  order: z.number().default(0),
  estimatedTime: z.string().optional(), // Auto-calculated from lessons, shown as estimate

  // Instructors — chapter can have different instructors
  instructors: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  })).default([{ name: 'Edumynt' }]),

  // Media
  image: imageSchema.optional(),

  // Status & versioning
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  version: z.string().default('1.0.0'),

  // SEO
  seo: seoSchema.optional(),
});

// ============================================================
// Lesson Collection (individual .mdx files in chapter folders)
// ============================================================

const lessonSchema = z.object({
  // Identity
  title: z.string().min(1, 'Lesson title is required'),
  slug: z.string().optional(),

  // Descriptions
  description: z.string().optional(),
  excerpt: z.string().optional(), // Short preview for cards

  // Categorization
  category: z.string().default('uncategorized'),
  tags: z.array(z.string()).default([]),

  // Lesson metadata
  order: z.number().default(0),
  estimatedTime: z.string().optional(), // e.g. "15 min"
  type: z.enum(['lesson', 'quiz', 'assignment', 'resource']).default('lesson'),

  // Difficulty
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),

  // Instructors — lesson can have specific instructors
  instructors: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  })).default([{ name: 'Edumynt' }]),

  // Dates
  date: z.date().optional(),
  updated: z.date().optional(),

  // Media
  image: imageSchema.optional(),
  coverImage: imageSchema.optional(),

  // Display
  featured: z.boolean().default(false),

  // Status & versioning
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  version: z.string().default('1.0.0'),

  // SEO
  seo: seoSchema.optional(),
});

// ============================================================
// Collection Definitions
// ============================================================

const courses = defineCollection({
  loader: glob({ pattern: '*/index.mdx', base: './src/content/courses' }),
  schema: courseSchema,
});

const chapters = defineCollection({
  loader: glob({ pattern: '*/*/index.mdx', base: './src/content/courses' }),
  schema: chapterSchema,
});

const lessons = defineCollection({
  loader: glob({ pattern: '*/*/!(index).{mdx,md}', base: './src/content/courses' }),
  schema: lessonSchema,
});

export const collections = {
  courses,
  chapters,
  lessons,
};

// ============================================================
// Type Exports
// ============================================================

export type Course = z.infer<typeof courseSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
