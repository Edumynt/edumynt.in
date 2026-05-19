# Edumynt AI Chatbot Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────────┐     ┌────────────┐  │
│  │  GitHub Pages │────▶│  Cloudflare      │────▶│ OpenRouter │  │
│  │  (Frontend)   │     │  Worker (Proxy)  │     │    API     │  │
│  └──────────────┘     └──────────────────┘     └────────────┘  │
│         │                      │                                │
│         │                      │                                │
│         ▼                      ▼                                │
│  ┌──────────────┐     ┌──────────────────┐                     │
│  │  Course MDX   │     │  API Key Stored  │                     │
│  │  Content      │     │  as Secret       │                     │
│  └──────────────┘     └──────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why Cloudflare Worker?

Since GitHub Pages is a **static host**, you cannot securely store API keys. Any key in your frontend code would be exposed to users.

**Solution**: Use Cloudflare Worker as a secure proxy:
- API key is stored as a secret (never exposed)
- Frontend calls the Worker
- Worker calls OpenRouter with the secret key
- Response is returned to frontend

## Files Created

### Cloudflare Worker
- `cloudflare-worker/wrangler.toml` - Worker configuration
- `cloudflare-worker/package.json` - Dependencies
- `cloudflare-worker/tsconfig.json` - TypeScript config
- `cloudflare-worker/src/index.ts` - Worker code
- `cloudflare-worker/DEPLOY.md` - Deployment guide

### Frontend
- `src/components/Chatbot.astro` - Chatbot UI component
- `src/lib/chat-api.ts` - API client utilities
- `src/layouts/BaseLayout.astro` - Added meta tag for API URL
- `src/pages/courses/[course]/[...slug].astro` - Added chatbot to lesson pages

### Configuration
- `.env.example` - Environment variable template

---

## Step-by-Step Setup

### Step 1: Deploy Cloudflare Worker

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   cd cloudflare-worker
   wrangler login
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set your OpenRouter API key**:
   ```bash
   wrangler secret put OPENROUTER_API_KEY
   ```
   Get your API key from: https://openrouter.ai/keys

5. **Update `wrangler.toml`**:
   ```toml
   [vars]
   ALLOWED_ORIGINS = "https://edumynt.in,http://localhost:4321"
   ```

6. **Deploy**:
   ```bash
   npm run deploy
   ```

7. **Save your Worker URL** (e.g., `https://edumynt-chatbot.your-subdomain.workers.dev`)

### Step 2: Configure Frontend

1. **Create `.env` file** in project root:
   ```bash
   PUBLIC_CHAT_API_URL=https://edumynt-chatbot.your-subdomain.workers.dev
   ```

2. **Add to `.gitignore`** (if not already there):
   ```
   .env
   ```

### Step 3: Test Locally

1. **Start Astro dev server**:
   ```bash
   npm run dev
   ```

2. **Open a course lesson** in your browser

3. **Click the chat button** (bottom-right corner)

4. **Try asking a question** about the course content

---

## Free Models Available

The worker uses these free models from OpenRouter:

| Model | Strengths | Context Length |
|-------|-----------|----------------|
| `google/gemini-2.0-flash-exp:free` | Fast, good reasoning | 1M tokens |
| `mistralai/mistral-7b-instruct:free` | Good for Q&A | 32K tokens |
| `microsoft/phi-3-mini-128k-instruct:free` | Lightweight | 128K tokens |
| `meta-llama/llama-3.1-8b-instruct:free` | Strong general | 128K tokens |
| `qwen/qwen-2-7b-instruct:free` | Good for Asian languages | 32K tokens |

To change the model, edit `cloudflare-worker/src/index.ts` and modify the `FREE_MODELS` array.

---

## How It Works

### 1. User Opens a Lesson Page
```
User navigates to /courses/indian-writers/rk-narayan/...
```

### 2. Chatbot Extracts Context
```javascript
// Automatically extracts text from the current page
const context = document.querySelector('article').textContent;
```

### 3. User Asks a Question
```
User: "What are the main themes in R.K. Narayan's works?"
```

### 4. Request Sent to Cloudflare Worker
```json
{
  "message": "What are the main themes in R.K. Narayan's works?",
  "courseId": "indian-writers",
  "courseContext": "...extracted page content..."
}
```

### 5. Worker Calls OpenRouter
```typescript
const response = await fetch('https://openrouter.ai/api/v/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SECRET_API_KEY}`, // Secure!
  },
  body: JSON.stringify({
    model: 'google/gemini-2.0-flash-exp:free',
    messages: [
      { role: 'system', content: 'You are a tutor...' + context },
      { role: 'user', content: message }
    ]
  })
});
```

### 6. Response Returned to User
```
Assistant: "R.K. Narayan's works explore several key themes:
1. The clash between tradition and modernity
2. The everyday lives of ordinary people in Malgudi
3. Human relationships and social dynamics
..."
```

---

## Customization Options

### Change System Prompt
Edit `cloudflare-worker/src/index.ts` → `buildSystemPrompt()` function.

### Add Rate Limiting
Add to `cloudflare-worker/src/index.ts`:
```typescript
// Simple rate limiting by IP
const clientIP = request.headers.get('CF-Connecting-IP');
// Implement your rate limiting logic
```

### Add Analytics
Track usage in the Worker:
```typescript
// Log to Cloudflare Analytics
console.log(JSON.stringify({
  courseId: body.courseId,
  timestamp: new Date().toISOString(),
  // ... other metrics
}));
```

---

## Troubleshooting

### CORS Errors
**Error**: `Access-Control-Allow-Origin` header missing

**Fix**: Update `ALLOWED_ORIGINS` in `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://edumynt.in,http://localhost:4321"
```

### API Key Not Working
**Error**: 401 Unauthorized from OpenRouter

**Fix**: Verify the secret is set:
```bash
wrangler secret list
```

### Worker Not Responding
**Error**: 500 Internal Server Error

**Fix**: Check Worker logs:
```bash
wrangler tail
```

### Chat Button Not Appearing
**Fix**: Ensure `client:load` directive is present:
```astro
<Chatbot courseId={courseId} client:load />
```

---

## Security Considerations

1. **API Key Security**: Key is stored as a Cloudflare secret, never exposed to users
2. **CORS**: Only your domains can call the Worker
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Input Validation**: Worker validates all incoming requests
5. **No History**: As requested, no conversation history is stored

---

## Cost Estimate

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| Cloudflare Worker | 100K requests/day | ~500-1000/day estimated |
| OpenRouter Free Models | Unlimited | Within free limits |
| GitHub Pages | Unlimited | Already using |

**Total Cost: $0/month**

---

## Next Steps

1. Deploy the Cloudflare Worker
2. Get your OpenRouter API key
3. Configure the environment variable
4. Test on a lesson page
5. Iterate on the system prompt for better responses

---

## Support

For issues with:
- **Cloudflare Worker**: https://developers.cloudflare.com/workers/
- **OpenRouter**: https://openrouter.ai/docs
- **Astro**: https://docs.astro.build
