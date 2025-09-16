import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { generateEmbedding } from "@/lib/embeddings";
import { vectorStore } from "@/lib/vectorStore";
import { validateChatInput } from "@/lib/validation";
import { CONFIG } from "@/lib/config";
import { chatRateLimit, getClientIdentifier, createRateLimitResponse } from "@/lib/rateLimit";
import { getConversationHistory, addToConversationHistory } from "@/lib/conversation";

async function findRelevantChunks(question: string) {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    // Find most similar chunks
    const relevantChunks = await vectorStore.findMostSimilar(questionEmbedding, CONFIG.MAX_CONTEXT_CHUNKS);
    
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
    const { question, model: requestModel = CONFIG.DEFAULT_MODEL, conversationHistory } = await req.json();
    model = requestModel;
    
    // Validate input
    const validatedQuestion = validateChatInput(question, model);


    const relevantChunks = await findRelevantChunks(validatedQuestion);

  if (relevantChunks.length === 0 && conversationHistory.length === 0) {
    return NextResponse.json({
      answer: "I don't have any documents to reference. Please upload some documents first."
    });
  }

  const context = relevantChunks
    .map((chunk, index) => 
      `Source ${index + 1} (${chunk.metadata.fileName}):\n${chunk.text}`
    )
    .join("\n\n");

    const history = getConversationHistory().map((msg: any) => `${msg.role}: ${msg.content}`).join("\n");

    const prompt = `You are an HR assistant. Your task is to answer the following question based on the provided document excerpts and conversation history. 

Conversation History:
${history}

Context:
${context}

Question: ${validatedQuestion}

Please follow these instructions:
1.  Provide a clear and concise answer to the question.
2.  If the answer is not found in the documents, state that clearly.
3.  Base your answer *only* on the information provided in the context and history above.
4.  After your answer, provide a confidence score (from 0 to 1) indicating how confident you are in your answer.
5.  Finally, briefly explain the reasoning for your answer and confidence score.`;

    const response = await ollama.generate({
      model,
      prompt,
    });

    addToConversationHistory({ role: "user", content: validatedQuestion });
    addToConversationHistory({ role: "assistant", content: response.response });

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
      } else if (error.message.includes('timed out')) {
        return NextResponse.json({ 
          error: `Connection to Ollama timed out. Please ensure Ollama is running and accessible.` 
        }, { status: 504 });
      }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
