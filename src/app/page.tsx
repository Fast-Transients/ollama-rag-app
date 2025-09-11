"use client";

import { useState, useEffect, useRef } from "react";
import DocumentManager from "@/components/DocumentManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemma3:12b");
  const [messages, setMessages] = useState<{ 
    role: string; 
    content: string;
    model?: string;
    sources?: { text: string; fileName: string; similarity: string }[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    fileName: string;
    uploadDate: string;
    fileType: string;
    chunksCount: number;
  }[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableModels = [
    { value: "gemma3:12b", label: "Gemma3 12B (Balanced)" },
    { value: "gpt-oss:20b", label: "GPT-OSS 20B (Powerful)" },
    { value: "gemma3:4b", label: "Gemma3 4B (Medium)" },
    { value: "llama3.2:3b", label: "Llama 3.2 3B (Fast)" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        
        // Update document list
        const newDocs = files.map(file => ({
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          fileType: file.name.split('.').pop() || 'unknown',
          chunksCount: Math.ceil(data.stats?.chunksCreated / files.length) || 0
        }));
        setUploadedDocuments(prev => [...prev, ...newDocs]);
        setFiles([]);
        setUploadStatus(`✅ Successfully processed ${files.length} file${files.length > 1 ? 's' : ''} (${data.stats?.chunksCreated} chunks created)`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setUploadStatus(""), 5000);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        setUploadStatus(`❌ Upload failed: ${errorData.error || "Unknown error"}`);
        setTimeout(() => setUploadStatus(""), 5000);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus(`❌ Upload failed: ${error instanceof Error ? error.message : 'Network error'}`);
      setTimeout(() => setUploadStatus(""), 5000);
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
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">
          HR Document Q&A
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 flex-1 min-h-0">
          <DocumentManager
            files={files}
            setFiles={setFiles}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            availableModels={availableModels}
            onUpload={handleUpload}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
            uploadStatus={uploadStatus}
          />

          <div className="lg:col-span-8 flex flex-col min-h-0 order-1 lg:order-2">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="hidden sm:inline">HR Document Q&A</span>
                  <span className="sm:hidden">Chat</span>
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {messages.filter(m => m.role === 'assistant').length} responses
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
                <ScrollArea className="flex-1 p-3 md:p-4 border rounded-md"
                  style={{ height: 'clamp(300px, 60vh, 600px)' }}>
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
                          className={`w-full sm:max-w-[85%] p-3 md:p-4 rounded-lg shadow-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border"
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
                          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                            {msg.role === "assistant" ? (
                              <ReactMarkdown
                                components={{
                                  p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({...props}) => <ul className="mb-2 pl-4" {...props} />,
                                  ol: ({...props}) => <ol className="mb-2 pl-4" {...props} />,
                                  li: ({...props}) => <li className="mb-1" {...props} />,
                                  code: ({...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                                  pre: ({...props}) => <pre className="bg-muted p-2 rounded text-xs overflow-x-auto" {...props} />,
                                  blockquote: ({...props}) => <blockquote className="border-l-2 border-muted-foreground/20 pl-2 italic" {...props} />,
                                  strong: ({...props}) => <strong className="font-semibold" {...props} />,
                                  em: ({...props}) => <em className="italic" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            )}
                          </div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/20">
                              <div className="text-xs font-medium mb-3 text-muted-foreground">Sources ({msg.sources.length}):</div>
                              <div className="space-y-3">
                                {msg.sources.map((source, srcIndex) => (
                                  <div key={srcIndex} className="bg-muted/30 rounded p-2 md:p-3 space-y-2">
                                    <div className="text-xs italic text-muted-foreground leading-relaxed break-words">
                                      "{source.text}"
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                      <span className="font-mono text-xs text-muted-foreground truncate">📄 {source.fileName}</span>
                                      <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                                        {(parseFloat(source.similarity) * 100).toFixed(1)}% match
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
                  <Input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="flex-grow text-base md:text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    size="icon"
                    className="h-10 w-10 md:h-9 md:w-9"
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