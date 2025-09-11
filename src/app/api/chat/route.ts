import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { generateEmbedding, findMostSimilar } from "@/lib/embeddings";
import { vectorStore } from "@/lib/vectorStore";
import { validateChatInput } from "@/lib/validation";
import { CONFIG } from "@/lib/config";
import { chatRateLimit, getClientIdentifier, createRateLimitResponse } from "@/lib/rateLimit";

async function findRelevantChunks(question: string) {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    // Get all document chunks
    const allChunks = await vectorStore.getAllChunks();
    
    if (allChunks.length === 0) {
      return [];
    }
    
    // Find most similar chunks
    const relevantChunks = findMostSimilar(questionEmbedding, allChunks, CONFIG.MAX_CONTEXT_CHUNKS);
    
    return relevantChunks;
  } catch (error) {
    console.error("Error finding relevant chunks:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(req);
  if (!chatRateLimit.isAllowed(clientId)) {
    const resetTime = chatRateLimit.getResetTime(clientId);
    return createRateLimitResponse(resetTime);
  }

  let model = CONFIG.DEFAULT_MODEL;
  
  try {
    const { question, model: requestModel = CONFIG.DEFAULT_MODEL } = await req.json();
    model = requestModel;
    
    // Validate input
    const validatedQuestion = validateChatInput(question, model);


    const relevantChunks = await findRelevantChunks(validatedQuestion);

  if (relevantChunks.length === 0) {
    return NextResponse.json({ 
      answer: "I don't have any documents to reference. Please upload some documents first."
    });
  }

  const context = relevantChunks
    .map((chunk, index) => 
      `Source ${index + 1} (${chunk.metadata.fileName}):\n${chunk.text}`
    )
    .join("\n\n");

    const prompt = `You are an HR assistant. Based on the following document excerpts, please answer the question. If the answer is not found in the documents, say so clearly.\n\nContext:\n${context}\n\nQuestion: ${validatedQuestion}\n\nPlease provide a helpful and accurate answer based only on the information provided in the context above.`;

    const response = await ollama.generate({
      model,
      prompt,
    });

    return NextResponse.json({ 
      answer: response.response,
      sources: relevantChunks.map(chunk => ({
        text: chunk.text.length > 150 ? chunk.text.substring(0, 150) + "..." : chunk.text,
        fileName: chunk.metadata.fileName,
        similarity: chunk.similarity?.toFixed(3) || "N/A"
      }))
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('Question') || error.message.includes('model')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      // Handle Ollama errors
      if (error.message.includes('not found')) {
        return NextResponse.json({ 
          error: `Model '${model}' not found. Please download it using: ollama pull ${model}` 
        }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
