/**
 * Course content context for the chatbot.
 * This provides search functionality over course content.
 */

export interface CourseChunk {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'course' | 'chapter' | 'lesson';
}

/**
 * Search for relevant content based on query
 */
export function searchRelevantChunks(
  chunks: CourseChunk[],
  query: string,
  currentCourse?: string,
  maxChunks: number = 5
): CourseChunk[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) return [];
  
  const scored = chunks.map(chunk => {
    let score = 0;
    const content = chunk.content.toLowerCase();
    const title = chunk.title.toLowerCase();
    
    // Boost for current course
    if (currentCourse && chunk.courseId === currentCourse) {
      score += 20;
    }
    
    // Score based on keyword matches in title (higher weight)
    for (const word of queryWords) {
      if (title.includes(word)) score += 10;
      // Count occurrences in content
      const regex = new RegExp(word, 'gi');
      const matches = content.match(regex);
      if (matches) score += Math.min(matches.length, 5);
    }
    
    return { chunk, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => s.chunk);
}

/**
 * Get context string for AI from relevant chunks
 */
export function getContextFromChunks(chunks: CourseChunk[]): string {
  if (chunks.length === 0) return '';
  
  return chunks.map(chunk => `
## ${chunk.title} (${chunk.type})
${chunk.content.substring(0, 2000)}
  `).join('\n---\n');
}

/**
 * Get all course titles and descriptions for general queries
 */
export function getCourseList(chunks: CourseChunk[]): string {
  const courses = chunks.filter(c => c.type === 'course');
  return courses.map(c => `- **${c.title}**: ${c.content.substring(0, 200)}`).join('\n');
}
