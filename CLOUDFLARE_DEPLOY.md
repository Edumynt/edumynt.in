# Edumynt - Cloudflare Pages Deployment Guide

## Architecture

Since you're hosting on Cloudflare Pages, you can use **Cloudflare Pages Functions** for the API. The frontend is static, and Functions handle the secure API calls:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │  Static Frontend  │────▶│  Pages Function  │                 │
│  │  (Astro Build)   │     │  (/api/chat)     │                 │
│  └──────────────────┘     └────────┬─────────┘                 │
│                                    │                            │
│                                    ▼                            │
│                           ┌──────────────────┐                 │
│                           │  OpenRouter API  │                 │
│                           │  (Secure Key)    │                 │
│                           └──────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

- `functions/chat.ts` - Cloudflare Pages Function for chat API
- `wrangler.toml` - Cloudflare configuration
- `src/components/Chatbot.astro` - Chatbot UI component
- `src/lib/chat-api.ts` - API client utilities

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `wrangler` - Cloudflare CLI for local testing
- `@cloudflare/workers-types` - TypeScript types

---

## Step 2: Get OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Create a free account
3. Generate an API key
4. Save it for the next steps

---

## Step 3: Test Locally

### Option A: Basic Astro Dev (UI only, no API)

```bash
npm run dev
```

This starts the Astro dev server at `http://localhost:4321`. The chatbot UI will appear but API calls won't work (expected).

### Option B: Full Local Testing (with API)

1. **Create `.dev.vars` file** in project root:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Important**: `.dev.vars` is automatically gitignored - never commit it!

2. **Build and start local Cloudflare server**:

```bash
# Build the project
npm run build

# Start local Cloudflare Pages dev server
npm run cf:dev
```

This starts a local server (usually at `http://localhost:8788`) that simulates Cloudflare Pages including Functions.

3. **Test the chatbot**:
   - Open the local URL in your browser
   - Navigate to any course lesson
   - Click the chat button (bottom-right corner)
   - Ask a question about the course content

---

## Step 4: Deploy to Cloudflare Pages

### 4.1 Connect Repository to Cloudflare

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create application** → **Connect to Git**
4. Select your GitHub repository
5. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 4.2 Set Environment Variables

In Cloudflare Dashboard:

1. Go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add the following:

| Variable | Value | Type |
|----------|-------|------|
| `OPENROUTER_API_KEY` | `your_api_key_here` | Secret |

**Important**: Mark `OPENROUTER_API_KEY` as a **Secret** (encrypted).

### 4.3 Deploy

Cloudflare will automatically deploy on every push to your main branch.

To deploy manually:

```bash
npm run build
npm run cf:deploy
```

---

## Step 5: Add Custom Domain (edumynt.in)

1. In Cloudflare Dashboard, go to your Pages project
2. Navigate to **Custom domains**
3. Add `edumynt.in`
4. Update your DNS records as instructed

---

## Local Development Workflow

### Quick Start (UI only)

```bash
npm run dev
# Open http://localhost:4321
```

### Full Testing (with API)

```bash
# 1. Create .dev.vars with your API key
echo "OPENROUTER_API_KEY=your_key" > .dev.vars

# 2. Build and start local Cloudflare server
npm run build
npm run cf:dev

# 3. Open the URL shown in terminal (usually http://localhost:8788)
```

---

## Project Structure

```
edumynt.in/
├── functions/
│   └── chat.ts              # Cloudflare Pages Function
├── src/
│   ├── components/
│   │   └── Chatbot.astro    # Chatbot UI component
│   ├── layouts/
│   │   └── BaseLayout.astro # Updated with meta tag
│   ├── lib/
│   │   └── chat-api.ts      # API client utilities
│   └── pages/
│       └── courses/
│           └── [course]/
│               └── [...slug].astro  # Updated with chatbot
├── astro.config.mjs         # Astro configuration
├── wrangler.toml            # Cloudflare configuration
├── .dev.vars                # Local dev secrets (gitignored)
└── .env.example             # Environment variable template
```

---

## Troubleshooting

### Chat button not appearing
- Make sure you're on a course lesson page
- Check browser console for errors
- Verify `client:load` directive is present in Chatbot.astro

### API errors
- Check Cloudflare Pages Function logs in Dashboard
- Verify `OPENROUTER_API_KEY` is set as a secret
- Test the API directly:
  ```bash
  curl -X POST https://your-site.pages.dev/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
  ```

### Build errors
```bash
# Clear cache and rebuild
rm -rf dist .astro node_modules/.cache
npm run build
```

### Local dev server issues
```bash
# Make sure wrangler is installed
npx wrangler --version

# Try restarting
npm run build
npm run cf:dev
```

### TypeScript errors
These are expected before running `npm install`. After installing dependencies, the errors should resolve.

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Cloudflare Pages | Unlimited bandwidth |
| Pages Functions | 100,000 requests/day |
| OpenRouter Free Models | Unlimited (rate limited) |

---

## Security

1. **API Key**: Stored as Cloudflare secret, never exposed to users
2. **CORS**: Configured to allow your domain
3. **No History**: No conversation history stored (as requested)
4. **Input Validation**: All requests validated in the Function

---

## Customization

### Change AI Model

Edit `functions/chat.ts`:

```typescript
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',  // Default - fast
  'mistralai/mistral-7b-instruct:free', // Alternative
  'meta-llama/llama-3.1-8b-instruct:free', // More capable
];
```

### Modify System Prompt

Edit the `buildSystemPrompt()` function in `functions/chat.ts` to customize the AI's behavior.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Basic Astro dev (UI only) |
| `npm run build` | Build for production |
| `npm run cf:dev` | Full local testing with Functions |
| `npm run cf:deploy` | Deploy to Cloudflare Pages |

---

## Next Steps

1. Run `npm install` to install dependencies
2. Create `.dev.vars` with your OpenRouter API key
3. Test locally with `npm run cf:dev`
4. Push to GitHub to trigger Cloudflare deployment
5. Set `OPENROUTER_API_KEY` secret in Cloudflare Dashboard
6. Add custom domain `edumynt.in` in Cloudflare Dashboard
7. Test on your live site!

---

## Support

- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Functions: https://developers.cloudflare.com/pages/functions/
- OpenRouter: https://openrouter.ai/docs
- Astro: https://docs.astro.build
