import { promises as fs } from "fs";
import path from "path";
import { DocumentChunk } from "./embeddings";

export class VectorStore {
  private dbPath: string;
  private chunks: DocumentChunk[] = [];

  constructor() {
    this.dbPath = path.join(process.cwd(), "/vector-db.json");
    this.loadData();
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
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async addChunks(newChunks: DocumentChunk[]): Promise<void> {
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

  getStats(): { totalChunks: number; uniqueFiles: number } {
    const uniqueFiles = new Set(this.chunks.map(chunk => chunk.metadata.fileName));
    return {
      totalChunks: this.chunks.length,
      uniqueFiles: uniqueFiles.size
    };
  }
}

export const vectorStore = new VectorStore();