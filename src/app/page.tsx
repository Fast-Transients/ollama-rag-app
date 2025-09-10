"use client";

import { useState } from "react";
import DocumentManager from "@/components/DocumentManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-oss:20b");
  const [messages, setMessages] = useState<{ 
    role: string; 
    content: string;
    model?: string;
    sources?: { fileName: string; similarity: string }[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    fileName: string;
    uploadDate: string;
    fileType: string;
    chunksCount: number;
  }[]>([]);

  const availableModels = [
    { value: "gpt-oss:20b", label: "GPT-OSS 20B (Powerful)" },
    { value: "gemma3:12b", label: "Gemma3 12B (Balanced)" },
    { value: "gemma3:4b", label: "Gemma3 4B (Medium)" },
    { value: "llama3.2:3b", label: "Llama 3.2 3B (Fast)" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Files uploaded successfully! Created ${data.stats?.chunksCreated || 0} text chunks.`);
        
        // Update document list
        const newDocs = files.map(file => ({
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          fileType: file.name.split('.').pop() || 'unknown',
          chunksCount: Math.ceil(data.stats?.chunksCreated / files.length) || 0
        }));
        setUploadedDocuments(prev => [...prev, ...newDocs]);
        setFiles([]);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        alert(`File upload failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("An error occurred while uploading files.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, model: selectedModel }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: data.answer,
            model: selectedModel,
            sources: data.sources || []
          },
        ]);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errorData.error || "Sorry, I had an error."}`, model: selectedModel },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had an error." },
      ]);
    } finally {
      setQuestion("");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4 max-h-screen flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-8">
          HR Document Q&A
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0">
          <DocumentManager
            files={files}
            setFiles={setFiles}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            availableModels={availableModels}
            onUpload={handleUpload}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />

          <div className="md:col-span-8 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <span>HR Document Q&A</span>
                  {messages.length > 0 && (
                    <Badge variant="secondary">
                      {messages.filter(m => m.role === 'assistant').length} responses
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
                <ScrollArea className="flex-1 p-4 border rounded-md">
                  <div className="space-y-4 pr-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>Upload some documents and start asking questions!</p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-sm">
                              {msg.role === "user" ? "You" : "Assistant"}
                            </div>
                            {msg.model && msg.role === "assistant" && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {availableModels.find(m => m.value === msg.model)?.label || msg.model}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm leading-relaxed">{msg.content}</div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="text-xs font-medium mb-2">Sources:</div>
                              <div className="space-y-1">
                                {msg.sources.map((source, srcIndex) => (
                                  <div key={srcIndex} className="flex justify-between items-center text-xs">
                                    <span className="truncate">{source.fileName}</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {source.similarity}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
                  <Input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}