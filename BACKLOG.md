# Project Backlog

This document tracks the identified issues and planned improvements for the Ollama RAG application.

## Critical Issues

*   **[Done] Replace file-based vector store:** The current `VectorStore` implementation uses a single JSON file, which is not scalable and prone to race conditions.
    *   **Task:** Replace with a robust vector database solution (e.g., ChromaDB, Faiss).
*   **[Done] Inefficient Chat Functionality:** The chat API loads all document chunks into memory for every user query, which is highly inefficient.
    *   **Task:** Refactor the chat API to perform the similarity search within the vector database.

## Medium-Priority Issues

*   **[Done] Inefficient Document Processing:** The application processes uploaded files sequentially and loads them entirely into memory.
    *   **Task:** Parallelize file processing and implement a streaming approach for large files.
*   **[Done] Basic Prompt Engineering:** The prompt for the chat API is simplistic and could be improved for better results.
    *   **Task:** Enhance the prompt with more instructions, such as asking for confidence scores or explanations.
*   **[Done] No Conversation History:** The chat is stateless, so users cannot ask follow-up questions.
    *   **Task:** Implement a mechanism to maintain conversation history.

## Low-Priority Issues

*   **[Done] Basic Text Chunking:** The text chunking is rudimentary and may not be effective for all document types.
    *   **Task:** Implement a more sophisticated text chunking strategy (e.g., token-based or sentence-based).
*   **[Done] Basic Error Handling:** Error handling could be more robust and provide more specific feedback to the user.
    *   **Task:** Improve error handling throughout the application.
