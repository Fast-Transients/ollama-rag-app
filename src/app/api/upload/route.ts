import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { generateEmbedding, chunkText, DocumentChunk } from "@/lib/embeddings";
import { vectorStore } from "@/lib/vectorStore";
import { v4 as uuidv4 } from "uuid";
import { validateFileUpload, sanitizeFileName, MAX_FILES_PER_UPLOAD } from "@/lib/validation";
import { CONFIG } from "@/lib/config";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function processFile(file: File): Promise<DocumentChunk[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = path.extname(file.name).toLowerCase();
  const uploadDate = new Date().toISOString();

  let text = "";

  if (fileExtension === ".pdf") {
    const data = await pdf(buffer);
    text = data.text;
  } else if (fileExtension === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    text = buffer.toString("utf-8");
  }

  // Clean and chunk the text
  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks = chunkText(cleanText);
  
  // Generate embeddings for each chunk
  const documentChunks: DocumentChunk[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    documentChunks.push({
      id: uuidv4(),
      text: chunks[i],
      embedding,
      metadata: {
        fileName: file.name,
        chunkIndex: i,
        uploadDate,
        fileType: fileExtension
      }
    });
  }

  return documentChunks;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json({ 
      error: `Too many files. Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload.` 
    }, { status: 400 });
  }

  // Validate all files before processing
  try {
    for (const file of files) {
      validateFileUpload(file);
    }
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "File validation failed" 
    }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), CONFIG.UPLOAD_DIR);

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const allChunks: DocumentChunk[] = [];

  for (const file of files) {
    try {
      // Save the file with sanitized name
      const buffer = Buffer.from(await file.arrayBuffer());
      const sanitizedName = sanitizeFileName(file.name);
      const filePath = path.join(uploadDir, sanitizedName);
      await fs.writeFile(filePath, buffer);
      
      // Process file and generate chunks with embeddings
      const chunks = await processFile(file);
      allChunks.push(...chunks);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      return NextResponse.json(
        { error: `Failed to process file: ${file.name}` },
        { status: 500 }
      );
    }
  }

  // Store chunks in vector database
  await vectorStore.addChunks(allChunks);

  const stats = vectorStore.getStats();
  return NextResponse.json({ 
    message: "Files uploaded and processed successfully.",
    stats: {
      chunksCreated: allChunks.length,
      totalChunks: stats.totalChunks,
      totalFiles: stats.uniqueFiles
    }
  });
}