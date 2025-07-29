import { defineCollection, z } from 'astro:content';

const courses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.date().optional(),
    updated: z.date().optional(),
    draft: z.boolean().default(false),
    course: z.string(),
    // Remove chapter field - we'll derive path from file structure
    order: z.number().optional(),
    author: z.string().optional(),
  }),
});

export const collections = {
  courses,
};