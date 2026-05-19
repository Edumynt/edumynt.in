/**
 * Chat API client for communicating with the Cloudflare Worker
 */

const API_BASE_URL = import.meta.env.PUBLIC_CHAT_API_URL || 'https://edumynt-chatbot.your-subdomain.workers.dev';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  courseId?: string;
  lessonId?: string;
  courseContext?: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export interface StreamChatCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

/**
 * Send a chat message and get a response
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((error as { error: string }).error || `HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Extract relevant course context from the current page content
 */
export function extractPageContext(): string {
  // Get the main content area
  const article = document.querySelector('article') || document.querySelector('main');
  
  if (!article) {
    return '';
  }

  // Extract text content, limiting to avoid token limits
  const textContent = article.textContent || '';
  return textContent.substring(0, 3000); // Limit context to ~3000 chars
}

/**
 * Get current course ID from URL
 */
export function getCurrentCourseId(): string | undefined {
  const path = window.location.pathname;
  const match = path.match(/\/courses\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Get current lesson ID from URL
 */
export function getCurrentLessonId(): string | undefined {
  const path = window.location.pathname;
  const match = path.match(/\/courses\/[^/]+\/(.+)/);
  return match ? match[1] : undefined;
}
