# HR Document Q&A System (RAG)

A production-ready Retrieval-Augmented Generation (RAG) system for HR documents that runs locally with Ollama for maximum security and privacy.

![HR Document Q&A](https://img.shields.io/badge/RAG-System-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-green)

## 🚀 Features

- **📄 Multi-format Document Support**: PDF, DOCX, and TXT files
- **🧠 Vector-based Semantic Search**: Uses embeddings for accurate document retrieval  
- **🤖 Multiple AI Models**: Compare responses from GPT-OSS, Gemma3, and Llama models
- **💾 Local Processing**: All data stays on your machine - no cloud dependencies
- **🎨 Professional UI**: Built with shadcn/ui components and responsive design
- **📊 Real-time Analytics**: Document and processing statistics
- **🔒 Security First**: Input validation, file sanitization, and secure processing

## 📋 Prerequisites

### System Requirements
- **Windows 10/11** (64-bit)
- **Node.js 18+** 
- **Git**
- **8GB RAM minimum** (16GB recommended for larger models)
- **10GB free disk space** (for AI models)

### Required Software

1. **Node.js** - Download from [nodejs.org](https://nodejs.org/)
2. **Git** - Download from [git-scm.com](https://git-scm.com/)
3. **Ollama** - Download from [ollama.com](https://ollama.com/)

## 🛠️ Installation Guide (Windows)

### Step 1: Install Ollama

1. Download Ollama from [ollama.com](https://ollama.com/)
2. Run the installer as Administrator
3. After installation, open **PowerShell** or **Command Prompt**
4. Verify installation:
   ```bash
   ollama --version
   ```

### Step 2: Download AI Models

Download the required models (this may take 10-30 minutes depending on your internet speed):

```bash
# Essential models (download these first)
ollama pull nomic-embed-text
ollama pull llama3.2:3b

# Additional models (optional but recommended)
ollama pull gpt-oss:20b
ollama pull gemma3:4b
ollama pull gemma3:12b
```

**Model Sizes:**
- `nomic-embed-text`: ~274MB (required for embeddings)
- `llama3.2:3b`: ~2GB (fast responses)
- `gemma3:4b`: ~2.6GB (balanced performance)
- `gemma3:12b`: ~7.4GB (high quality)
- `gpt-oss:20b`: ~11GB (most powerful)

### Step 3: Clone and Setup the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/doc-query-app.git
   cd doc-query-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Quick Start Guide

### 1. Upload Documents
- Click **"Upload Documents"** in the left panel
- Select PDF, DOCX, or TXT files (max 50MB each)
- Click **"Upload"** and wait for processing

### 2. Choose AI Model  
- Select your preferred model from the dropdown:
  - **GPT-OSS 20B**: Most powerful, slower responses
  - **Gemma3 12B**: Great balance of quality and speed
  - **Gemma3 4B**: Good quality, faster responses  
  - **Llama 3.2 3B**: Fastest responses

### 3. Ask Questions
- Type your HR-related question in the chat
- Get answers with source citations
- Compare responses across different models

### 4. Manage Documents
- View uploaded documents in the left panel
- See processing statistics (chunks, file types)
- Delete documents you no longer need

## 📁 Project Structure

```
doc-query-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── chat/          # Chat API endpoint
│   │   │   └── upload/        # File upload API
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── DocumentManager.tsx # Document management UI
│   └── lib/
│       ├── embeddings.ts      # Vector embedding utilities
│       ├── vectorStore.ts     # Document storage
│       ├── validation.ts      # Input validation
│       ├── config.ts          # Configuration
│       └── utils.ts           # Utility functions
├── uploads/                   # Uploaded files (auto-created)
├── vector-db.json            # Vector database (auto-created)
└── package.json              # Dependencies
```

## ⚙️ Configuration

The system uses sensible defaults, but you can customize settings in `src/lib/config.ts`:

```typescript
export const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,     // 50MB max file size
  MAX_FILES_PER_UPLOAD: 10,            // Max files per upload
  CHUNK_SIZE: 500,                     // Text chunk size in words
  CHUNK_OVERLAP: 50,                   // Overlap between chunks
  MAX_QUESTION_LENGTH: 1000,           // Max question length
  MAX_CONTEXT_CHUNKS: 5,               // Max chunks per query
  // ... more settings
};
```

## 🔒 Security Features

- **File Validation**: Strict file type and size checking
- **Path Sanitization**: Prevents directory traversal attacks
- **Input Validation**: All user inputs are validated and sanitized
- **Local Processing**: No data leaves your machine
- **Error Handling**: Comprehensive error handling and logging

## 🚨 Troubleshooting

### Common Issues

**1. "Model not found" error**
```bash
# Download the missing model
ollama pull <model-name>

# Check available models
ollama list
```

**2. Port already in use**
- The app will automatically use the next available port (3001, 3002, etc.)
- Check the console output for the correct URL

**3. Upload fails**
- Check file size (max 50MB)
- Ensure file type is PDF, DOCX, or TXT
- Check available disk space

**4. Slow responses**
- Use smaller models for faster responses (llama3.2:3b)
- Ensure sufficient RAM is available
- Close other applications if needed

**5. Build errors on Windows**
```bash
# Clear caches and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Performance Tips

- **For faster responses**: Use `llama3.2:3b`
- **For better quality**: Use `gemma3:12b` or `gpt-oss:20b`
- **Memory usage**: Close unused applications when running larger models
- **Storage**: Models are cached in Ollama's directory (~11GB total)

## 📊 Usage Statistics

The system tracks:
- Total documents uploaded
- Text chunks processed  
- File type distribution
- Processing statistics
- Response times and model usage

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **AI**: Ollama (local inference)
- **Vector Search**: Custom implementation with cosine similarity
- **File Processing**: pdf-parse, mammoth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/doc-query-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/doc-query-app/discussions)
- **Ollama Help**: [Ollama Documentation](https://ollama.com/docs)

## 🎖️ Acknowledgments

- [Ollama](https://ollama.com/) for local AI inference
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) for the fantastic framework
- [Vercel](https://vercel.com/) for hosting and deployment tools

---

**📝 Note**: This system is designed for HR document processing and keeps all data local for maximum privacy and security. Perfect for sensitive HR workflows!