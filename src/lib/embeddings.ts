import ollama from "ollama";
import { CONFIG } from "./config";
import { split } from "sentence-splitter";

export interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    fileName: string;
    chunkIndex: number;
    uploadDate: string;
    fileType: string;
  };
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for embedding generation');
  }
  
  try {
    const response = await ollama.embeddings({
      model: CONFIG.EMBEDDING_MODEL,
      prompt: text.trim(),
    });
    
    if (!response.embedding || !Array.isArray(response.embedding)) {
      throw new Error('Invalid embedding response from Ollama');
    }
    
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      throw new Error(`Embedding model '${CONFIG.EMBEDDING_MODEL}' not found. Please download it using: ollama pull ${CONFIG.EMBEDDING_MODEL}`);
    }
    throw new Error('Failed to generate embedding');
  }
}

export function chunkText(text: string): string[] {
  const sentences = split(text).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > CONFIG.CHUNK_SIZE) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += ` ${sentence}`;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}