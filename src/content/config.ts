import { defineCollection, z } from 'astro:content';

const courses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    course: z.string(), // "Literary Periods", "Literary Movements", "Indian Writers"
    chapter: z.string().optional(), // folder name like "renaissance", "tagore"
    order: z.number().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    date: z.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(), // Course image URL
  }),
});

export const collections = {
  courses,
};