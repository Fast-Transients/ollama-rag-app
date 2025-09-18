import { ChromaClient } from "chromadb";
import { CONFIG } from "./config";

const chroma = new ChromaClient();

export async function getChromaCollection() {
  try {
    const collection = await chroma.getOrCreateCollection({ name: "documents" });
    return collection;
  } catch (error) {
    console.error("Error getting Chroma collection:", error);
    throw new Error("Failed to get Chroma collection");
  }
}
