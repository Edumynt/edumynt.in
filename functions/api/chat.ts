export interface Env {
  OPENROUTER_API_KEY: string;
}

interface ChatRequest {
  message: string;
  courseId?: string;
  lessonId?: string;
  courseContext?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

    // Build system prompt with course context
    const systemPrompt = buildSystemPrompt(body);

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

function buildSystemPrompt(body: ChatRequest): string {
  const { courseId, lessonId, courseContext } = body;

  let prompt = `You are a helpful tutor for Edumynt, an educational platform for UGC NET and other competitive exam preparation.

Your role:
- Help students understand course concepts clearly
- Provide explanations based on the course content
- Answer questions about literary works, authors, and exam preparation
- Be concise but thorough in your responses
- Use markdown formatting for better readability

`;

  if (courseId) {
    prompt += `The student is currently studying: ${courseId}\n\n`;
  }

  if (lessonId) {
    prompt += `Current lesson: ${lessonId}\n\n`;
  }

  if (courseContext) {
    prompt += `Relevant course content:
${courseContext}

Instructions:
- Base your answer primarily on the provided course context
- If the question goes beyond the context, you may provide general knowledge but clarify when you're doing so
- Always be encouraging and supportive
- Suggest related topics from the course when relevant`;
  } else {
    prompt += `Note: No specific course context was provided. Answer based on your general knowledge about the topic, focusing on UGC NET exam preparation and Indian literature.`;
  }

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
      max_tokens: 1500,
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
