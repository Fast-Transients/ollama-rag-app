import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";

describe("API End-to-End Tests", () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev("src/app/api/[[...route]]/route.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("should upload a file, and then chat with it", async () => {
    // 1. Upload a file
    const formData = new FormData();
    const file = new Blob(["This is a test file about Gemini."], { type: "text/plain" });
    formData.append("files", file, "test.txt");

    const uploadRes = await worker.fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const uploadJson = await uploadRes.json();
    expect(uploadRes.status).toBe(200);
    expect(uploadJson.stats.totalFiles).toBe(1);

    // 2. Chat with the file
    const chatRes = await worker.fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is this file about?" }),
    });

    const chatJson = await chatRes.json();
    expect(chatRes.status).toBe(200);
    expect(chatJson.answer).toContain("Gemini");
  });
});
