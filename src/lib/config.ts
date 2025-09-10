export const CONFIG = {
  // File processing
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10,
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  
  // Text processing
  MAX_QUESTION_LENGTH: 1000,
  MAX_CONTEXT_CHUNKS: 5,
  
  // Paths
  UPLOAD_DIR: 'uploads',
  VECTOR_DB_FILE: 'vector-db.json',
  
  // Ollama
  DEFAULT_MODEL: 'gpt-oss:20b',
  EMBEDDING_MODEL: 'nomic-embed-text',
  
  // UI
  MAX_CHAT_MESSAGES: 100,
  CHAT_SCROLL_THRESHOLD: 0.8,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
} as const;