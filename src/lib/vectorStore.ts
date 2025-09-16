import { promises as fs } from "fs";
import path from "path";
import { DocumentChunk } from "./embeddings";

export class VectorStore {
  private dbPath: string;
  private chunks: DocumentChunk[] = [];

  constructor() {
    this.dbPath = path.join(process.cwd(), "data", "vector-db.json");
  }

  private async loadData(): Promise<void> {
    try {
      const content = await fs.readFile(this.dbPath, "utf-8");
      const data = JSON.parse(content);
      this.chunks = data.chunks || [];
    } catch {
      this.chunks = [];
    }
  }

  private async saveData(): Promise<void> {
    const data = {
      chunks: this.chunks,
      lastUpdated: new Date().toISOString()
    };
    
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async addChunks(newChunks: DocumentChunk[]): Promise<void> {
    await this.loadData();
    this.chunks.push(...newChunks);
    await this.saveData();
  }

  async getAllChunks(): Promise<DocumentChunk[]> {
    await this.loadData();
    return this.chunks;
  }

  async getChunksByFileName(fileName: string): Promise<DocumentChunk[]> {
    await this.loadData();
    return this.chunks.filter(chunk => chunk.metadata.fileName === fileName);
  }

  async deleteChunksByFileName(fileName: string): Promise<void> {
    await this.loadData();
    this.chunks = this.chunks.filter(chunk => chunk.metadata.fileName !== fileName);
    await this.saveData();
  }

  async clear(): Promise<void> {
    this.chunks = [];
    await this.saveData();
  }

  /**
   * Load the current store from disk and return basic statistics.
   * Ensures stats remain accurate across server restarts.
   */
  async getStats(): Promise<{ totalChunks: number; uniqueFiles: number }> {
    await this.loadData();
    const uniqueFiles = new Set(this.chunks.map(chunk => chunk.metadata.fileName));
    return {
      totalChunks: this.chunks.length,
      uniqueFiles: uniqueFiles.size
    };
  }
}

export const vectorStore = new VectorStore();