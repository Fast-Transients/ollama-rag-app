# HR Document RAG System

A local Retrieval-Augmented Generation system for HR documents using Ollama for secure AI inference. All processing happens locally with no external dependencies.

## Features

- Multi-format document processing (PDF, DOCX, TXT)
- Vector-based semantic search with embeddings
- Multiple AI model support (Gemma3, GPT-OSS, Llama)
- Local processing for maximum security
- Professional UI with mobile responsiveness
- Markdown rendering with code highlighting
- Source attribution with confidence scores
- Rate limiting and input validation

## Prerequisites

- Node.js 18+
- Git
- Ollama
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

## Installation

### 1. Install Ollama
Download from [ollama.com](https://ollama.com/) and verify installation:
```bash
ollama --version
```

### 2. Download AI Models
```bash
# Required
ollama pull nomic-embed-text
ollama pull llama3.2:3b

# Recommended
ollama pull gemma3:12b
ollama pull gemma3:4b
ollama pull gpt-oss:20b
```

### 3. Setup Project
```bash
git clone https://github.com/yourusername/doc-query-app.git
cd doc-query-app
npm install
npm run dev
```

Open http://localhost:3000

## Usage

### Document Upload
1. Select PDF, DOCX, or TXT files (max 50MB each)
2. Upload and wait for processing
3. Documents are chunked and embedded automatically

### Q&A Interface
1. Select AI model from dropdown
2. Type HR-related questions
3. Review answers with source citations
4. Compare responses across models

### Model Options
- **Gemma3 12B**: Balanced performance (default)
- **GPT-OSS 20B**: Highest quality
- **Gemma3 4B**: Good quality, faster
- **Llama 3.2 3B**: Fastest responses

## Configuration

Edit `src/lib/config.ts` for custom settings:
```typescript
export const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_FILES_PER_UPLOAD: 10,
  CHUNK_SIZE: 500,
  MAX_CONTEXT_CHUNKS: 5,
  DEFAULT_MODEL: 'gemma3:12b',
};
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API with rate limiting
│   │   └── upload/        # File upload and processing
│   └── page.tsx           # Main application
├── components/
│   └── DocumentManager.tsx # Document management UI
└── lib/
    ├── embeddings.ts      # Vector operations
    ├── vectorStore.ts     # Document storage
    ├── rateLimit.ts       # API protection
    └── validation.ts      # Input sanitization
```

## Security Features

- File type and size validation
- Input sanitization and validation
- Rate limiting (10 uploads/15min, 20 chat/min)
- Security headers (XSS, CSRF protection)
- Local processing only
- Protected data storage

## Use Cases

### HR Documentation
- Employee handbook Q&A
- Policy clarification
- Procedure lookup
- Compliance information

### Training Materials
- Onboarding document search
- Training manual queries
- Process documentation
- Best practice retrieval

### Legal and Compliance
- Contract clause search
- Regulation compliance
- Policy interpretation
- Audit preparation

## Troubleshooting

**Model not found error:**
```bash
ollama pull <model-name>
ollama list
```

**Upload failures:**
- Check file size (max 50MB)
- Verify file type (PDF, DOCX, TXT)
- Ensure sufficient disk space

**Performance issues:**
- Use smaller models for speed
- Close other applications
- Ensure adequate RAM

## Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

## Tech Stack

- Next.js 15 with TypeScript
- shadcn/ui components
- Tailwind CSS
- Ollama for AI inference
- Vector embeddings with cosine similarity
- File processing: pdf-parse, mammoth

## Documentation

Additional documentation available in `/docs`:
- [Deployment Guide](docs/DEPLOYMENT.md) - Docker, cloud deployment, Kubernetes
- [Security Guide](docs/SECURITY.md) - Security features and best practices  
- [API Documentation](docs/API.md) - Endpoint specifications and examples

Environment configuration available in `.env.example`.

## License

Licensed under the Apache License 2.0. See LICENSE file for details.

## Support

- GitHub Issues for bug reports
- GitHub Discussions for questions
- Ollama documentation at ollama.com/docs