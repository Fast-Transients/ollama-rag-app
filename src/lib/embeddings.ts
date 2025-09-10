import ollama from "ollama";
import { CONFIG } from "./config";

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

export function chunkText(text: string, chunkSize: number = CONFIG.CHUNK_SIZE, overlap: number = CONFIG.CHUNK_OVERLAP): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findMostSimilar(
  queryEmbedding: number[],
  documentChunks: DocumentChunk[],
  topK: number = 3
): (DocumentChunk & { similarity: number })[] {
  const similarities = documentChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}