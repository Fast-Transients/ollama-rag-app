import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VectorStore } from './vectorStore';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { DocumentChunk } from './embeddings';

describe('VectorStore.getStats', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(tmpdir(), 'vectorstore-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
  });

  afterEach(async () => {
    (process.cwd as unknown as { mockRestore: () => void }).mockRestore();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('returns stats loaded from disk', async () => {
    const dbPath = path.join(tempDir, 'data', 'vector-db.json');
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    const chunk: DocumentChunk = {
      id: '1',
      text: 'hello',
      embedding: [0.1, 0.2],
      metadata: {
        fileName: 'test.txt',
        chunkIndex: 0,
        uploadDate: new Date().toISOString(),
        fileType: '.txt'
      }
    };
    await fs.writeFile(
      dbPath,
      JSON.stringify({ chunks: [chunk], lastUpdated: new Date().toISOString() })
    );

    const store = new VectorStore();
    const stats = await store.getStats();
    expect(stats.totalChunks).toBe(1);
    expect(stats.uniqueFiles).toBe(1);
  });
});
