export interface Env {
  OPENROUTER_API_KEY: string;
}

interface ChatRequest {
  message: string;
  courseId?: string;
  lessonId?: string;
  courseContext?: string;
  pageUrl?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CourseChunk {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'course' | 'chapter' | 'lesson';
}

// Cache for content index
let contentCache: CourseChunk[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Primary model - owl-alpha (free on OpenRouter)
const DEFAULT_MODEL = 'openrouter/owl-alpha';

// Fallback free models if primary fails
const FALLBACK_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Parse request body
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get content index
    const contentIndex = await getContentIndex();
    
    // Build system prompt with course context
    const systemPrompt = buildSystemPrompt(body, contentIndex);

    // Prepare messages for OpenRouter
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: body.message },
    ];

    // Call OpenRouter API with fallback models
    const response = await callOpenRouterWithFallback(messages, env.OPENROUTER_API_KEY);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Handle CORS preflight
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return context.next();
};

/**
 * Fetch content index from static JSON file
 */
async function getContentIndex(): Promise<CourseChunk[]> {
  const now = Date.now();
  
  if (contentCache && (now - cacheTime) < CACHE_TTL) {
    return contentCache;
  }
  
  try {
    // Fetch from the static file we generated at build time
    const response = await fetch('https://edumynt.in/content-index.json');
    if (response.ok) {
      contentCache = await response.json();
      cacheTime = now;
      return contentCache || [];
    }
  } catch (error) {
    console.error('Failed to fetch content index:', error);
  }
  
  return [];
}

/**
 * Search for relevant content based on query
 */
function searchRelevantChunks(
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
    if (currentCourse && chunk.courseId.toLowerCase().includes(currentCourse.toLowerCase())) {
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
 * Build system prompt with all available context
 */
function buildSystemPrompt(body: ChatRequest, contentIndex: CourseChunk[]): string {
  const { message, courseId, courseContext, pageUrl } = body;

  // Get relevant content from index
  const relevantChunks = searchRelevantChunks(contentIndex, message, courseId, 5);
  const relevantContent = relevantChunks.map(chunk => 
    `## ${chunk.title} (${chunk.type})\n${chunk.content.substring(0, 1500)}`
  ).join('\n\n---\n\n');

  // Get course list for general queries
  const courseList = contentIndex
    .filter(c => c.type === 'course')
    .map(c => `- **${c.title}**`)
    .join('\n');

  let prompt = `You are a helpful tutor for Edumynt, an educational platform for UGC NET and other competitive exam preparation.

## Your Role
- Help students understand course concepts clearly
- Provide explanations based on the course content
- Answer questions about literary works, authors, and exam preparation
- Be concise but thorough in your responses
- Use markdown formatting for better readability
- If asked about courses, list the available courses

## Available Courses
${courseList}

## Site Information
- This is an educational platform for UGC NET English literature preparation
- Courses cover Indian Writers, Literary Periods, Literary Movements, Teaching Methods, and more
- The platform includes study materials, practice MCQs, and exam preparation resources

`;

  // Add relevant content if found
  if (relevantContent) {
    prompt += `## Relevant Course Content
${relevantContent}

`;
  }

  // Add current page context if available
  if (courseContext) {
    prompt += `## Current Page Content
${courseContext.substring(0, 2000)}

`;
  }

  // Add page URL context
  if (pageUrl) {
    prompt += `## Current Page URL
${pageUrl}

`;
  }

  prompt += `## Instructions
- Base your answer primarily on the provided course context
- If the question goes beyond the context, you may provide general knowledge but clarify when you're doing so
- Always be encouraging and supportive
- Suggest related topics from the course when relevant
- If asked about something not in the course content, politely let the user know and suggest what they can ask about`;

  return prompt;
}

async function callOpenRouterWithFallback(
  messages: OpenRouterMessage[],
  apiKey: string
) {
  // Try primary model first
  const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS];
  
  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}`);
      const result = await callOpenRouter(messages, apiKey, model);
      console.log(`Success with model: ${model}`);
      return result;
    } catch (error) {
      console.error(`Failed with model ${model}:`, error);
      // Continue to next model
    }
  }
  
  throw new Error('All models failed. Please try again later.');
}

async function callOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://edumynt.in',
      'X-Title': 'Edumynt Course Assistant',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', response.status, errorText);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
