# OpenCode Proxy

A free, open-source proxy for the OpenCode API, designed for use with JanitorAI and other AI chat interfaces.

## Try It Now

**Live Proxy**: [https://janitor-pi.vercel.app/](https://janitor-pi.vercel.app/)

## Features

- **Free API Access**: Connect to OpenCode's free models through a proxy
- **JanitorAI Compatible**: Works seamlessly with JanitorAI's custom proxy feature
- **Multi-Key Failover**: Automatic failover between multiple API keys on rate limit
- **Streaming Support**: Real-time streaming responses via Server-Sent Events (SSE)
- **Security Hardened**: Rate limiting, input validation, CORS headers, security headers
- **Zero Logging**: No user data or request metadata is logged or stored

## Supported Models

- `mimo-v2.5-free` — Thinking/reasoning model
- `deepseek-v4-flash-free` — Fast inference, thinking
- `nemotron-3-ultra-free` — Structured reasoning, thinking
- `north-mini-code-free` — Code-specialized
- `glm-4.7` — Zhipu AI, thinking/reasoning
- `deepseek-r1` — DeepSeek R1 distilled (32B), chain-of-thought
- `kimi-k2.5` — Moonshot, thinking/reasoning
- `qwen2.5-coder` — Alibaba, 32B code-specialized
- `mythomax` — Roleplay-optimized

## Setup

### 1. Get OpenCode API Keys

Sign up at [opencode.ai](https://opencode.ai) and generate API keys.

### 2. Deploy to Vercel

```bash
# Clone the repo
git clone https://github.com/WyvernCW/FreeProxy.git
cd FreeProxy

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod
```

### 3. Set Environment Variables

In your Vercel dashboard, add these environment variables:

```
# OpenCode (required - at least one)
OPENCODE_KEY_1=sk-your-first-api-key
OPENCODE_KEY_2=sk-your-second-api-key  (optional)
OPENCODE_KEY_3=sk-your-third-api-key   (optional)

# Cloudflare AI (for cloudflare models)
CLOUDFLARE_KEY_1=cfk-your-cloudflare-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Chub.ai (for mythomax)
CHUB_KEY_1=glpat-your-chub-api-key
```

### 4. Configure JanitorAI

In JanitorAI's API Settings:
- **Proxy URL**: `https://your-domain.vercel.app/v1/chat/completions`
- **Model Name**: Use one of the supported model IDs
- **API Key**: Any non-empty string (e.g., `abc`)

## API Endpoints

### POST `/v1/chat/completions`

Chat completion endpoint compatible with OpenAI's API format.

**Request Body:**
```json
{
  "model": "mimo-v2.5-free",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "max_tokens": 4096,
  "temperature": 0.7,
  "stream": true
}
```

**Response:**
Standard OpenAI-compatible chat completion response.

### GET `/v1/models`

Returns list of available models.

## Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: Message count, content length, body size limits
- **CORS Headers**: Properly configured for cross-origin access
- **Security Headers**: HSTS, CSP, X-Frame-Options, XSS Protection
- **No Logging**: Zero request metadata or user data storage

## Development

```bash
# Run locally
vercel dev

# Deploy to production
vercel --prod
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
