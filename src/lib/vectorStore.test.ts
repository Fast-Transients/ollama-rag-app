import { describe, it, expect, vi } from 'vitest';
import { VectorStore } from './vectorStore';
import { getChromaCollection } from './chroma';

vi.mock('./chroma', () => ({
  getChromaCollection: vi.fn(),
}));

describe('VectorStore', () => {
  it('getStats returns stats from the mock collection', async () => {
    const mockCollection = {
      get: vi.fn().mockResolvedValue({
        ids: ['1', '2'],
        metadatas: [{ fileName: 'test.txt' }, { fileName: 'test2.txt' }],
      }),
    };
    (getChromaCollection as vi.Mock).mockResolvedValue(mockCollection);

    const store = new VectorStore();
    const stats = await store.getStats();

    expect(stats.totalChunks).toBe(2);
    expect(stats.uniqueFiles).toBe(2);
  });
});
