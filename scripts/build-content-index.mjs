/**
 * Build script to generate a JSON index of all course content.
 * This runs at build time and creates a static file that the API can use.
 */

import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

async function buildIndex() {
  console.log('Building course content index...');
  
  const courses = await getCollection('courses');
  const chapters = await getCollection('chapters');
  const lessons = await getCollection('lessons');
  
  const chunks = [];
  
  // Index courses
  for (const course of courses) {
    chunks.push({
      id: course.id,
      courseId: course.data.title,
      title: course.data.title,
      content: (course.body || '').replace(/[#*`]/g, '').substring(0, 3000),
      type: 'course',
    });
  }
  
  // Index chapters
  for (const chapter of chapters) {
    const parts = chapter.id.split('/');
    chunks.push({
      id: chapter.id,
      courseId: parts[0] || '',
      title: chapter.data.title,
      content: (chapter.body || '').replace(/[#*`]/g, '').substring(0, 3000),
      type: 'chapter',
    });
  }
  
  // Index lessons
  for (const lesson of lessons) {
    const parts = lesson.id.split('/');
    chunks.push({
      id: lesson.id,
      courseId: parts[0] || '',
      title: lesson.data.title,
      content: (lesson.body || '').replace(/[#*`]/g, '').substring(0, 3000),
      type: 'lesson',
    });
  }
  
  // Write to public directory so it's accessible at runtime
  const outputPath = path.join(process.cwd(), 'public', 'content-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  
  console.log(`Indexed ${chunks.length} content chunks to ${outputPath}`);
}

buildIndex().catch(console.error);
