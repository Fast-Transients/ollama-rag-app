import { getChromaCollection } from "./chroma";
import { DocumentChunk } from "./embeddings";

export class VectorStore {
  async addChunks(newChunks: DocumentChunk[]): Promise<void> {
    const collection = await getChromaCollection();
    await collection.add({
      ids: newChunks.map(chunk => chunk.id),
      embeddings: newChunks.map(chunk => chunk.embedding),
      documents: newChunks.map(chunk => chunk.text),
      metadatas: newChunks.map(chunk => chunk.metadata),
    });
  }

  async getAllChunks(): Promise<any[]> {
    const collection = await getChromaCollection();
    const results = await collection.get();
    return results.documents;
  }

  async getChunksByFileName(fileName: string): Promise<any[]> {
    const collection = await getChromaCollection();
    const results = await collection.get({ where: { fileName } });
    return results.documents;
  }

  async deleteChunksByFileName(fileName: string): Promise<void> {
    const collection = await getChromaCollection();
    const results = await collection.get({ where: { fileName } });
    if (results.ids.length > 0) {
        await collection.delete({ ids: results.ids });
    }
  }

  async clear(): Promise<void> {
    const collection = await getChromaCollection();
    await collection.delete();
  }

  async getStats(): Promise<{ totalChunks: number; uniqueFiles: number }> {
    const collection = await getChromaCollection();
    const results = await collection.get();
    const uniqueFiles = new Set(results.metadatas.map((m: any) => m.fileName));
    return {
      totalChunks: results.ids.length,
      uniqueFiles: uniqueFiles.size,
    };
  }

  async findMostSimilar(queryEmbedding: number[], topK: number): Promise<(DocumentChunk & { similarity: number })[]> {
    const collection = await getChromaCollection();
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    if (!results.ids || !results.ids[0]) {
      return [];
    }

    const chunks: (DocumentChunk & { similarity: number })[] = [];
    for (let i = 0; i < results.ids[0].length; i++) {
      chunks.push({
        id: results.ids[0][i],
        text: results.documents[0][i],
        embedding: results.embeddings ? results.embeddings[0][i] : [],
        metadata: results.metadatas[0][i] as any,
        similarity: results.distances ? 1 - results.distances[0][i] : 0,
      });
    }

    return chunks;
  }
}

export const vectorStore = new VectorStore();
