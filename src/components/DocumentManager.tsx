"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, Upload, Trash2, FileText, BarChart3 } from "lucide-react";

interface Document {
  fileName: string;
  uploadDate: string;
  fileType: string;
  chunksCount: number;
}

interface Stats {
  totalDocuments: number;
  totalChunks: number;
  averageChunksPerDoc: number;
  fileTypes: Record<string, number>;
}

interface DocumentManagerProps {
  files: File[];
  setFiles: (files: File[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: Array<{ value: string; label: string }>;
  onUpload: () => void;
  uploadedDocuments: Document[];
  setUploadedDocuments: (docs: Document[]) => void;
}

export default function DocumentManager({
  files,
  setFiles,
  selectedModel,
  setSelectedModel,
  availableModels,
  onUpload,
  uploadedDocuments,
  setUploadedDocuments,
}: DocumentManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalChunks: 0,
    averageChunksPerDoc: 0,
    fileTypes: {},
  });

  useEffect(() => {
    const totalDocs = uploadedDocuments.length;
    const totalChunks = uploadedDocuments.reduce((sum, doc) => sum + doc.chunksCount, 0);
    const fileTypes = uploadedDocuments.reduce((types, doc) => {
      types[doc.fileType] = (types[doc.fileType] || 0) + 1;
      return types;
    }, {} as Record<string, number>);

    setStats({
      totalDocuments: totalDocs,
      totalChunks,
      averageChunksPerDoc: totalDocs > 0 ? Math.round(totalChunks / totalDocs) : 0,
      fileTypes,
    });
  }, [uploadedDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteDocument = (index: number) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  return (
    <div className={`transition-all duration-300 ${
      isExpanded ? 'md:col-span-4' : 'md:col-span-1'
    }`}>
      <Card className="h-full">
        {/* Always visible header with expand/collapse button */}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            {isExpanded ? (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">Documents</CardTitle>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <FileText className="h-5 w-5 mb-1" />
                <div className="text-xs font-medium text-center">Docs</div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`h-8 w-8 p-0 shrink-0 ${!isExpanded ? 'absolute top-2 right-2' : ''}`}
            >
              {isExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Collapsed state content */}
        {!isExpanded && (
          <CardContent className="pt-0 flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
              {stats.totalDocuments}
            </div>
            <div className="text-xs text-center text-muted-foreground">
              <div>Documents</div>
              <div className="font-mono text-xs">{stats.totalChunks} chunks</div>
            </div>
          </CardContent>
        )}

        {/* Expanded state content */}
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Stats Section */}
              <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <CardTitle className="text-base">Knowledge Base</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalDocuments}</div>
                      <div className="text-muted-foreground">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalChunks}</div>
                      <div className="text-muted-foreground">Chunks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{stats.averageChunksPerDoc}</div>
                      <div className="text-muted-foreground text-xs">Avg/Doc</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {Object.keys(stats.fileTypes).length}
                      </div>
                      <div className="text-muted-foreground text-xs">Types</div>
                    </div>
                  </div>
                  {Object.keys(stats.fileTypes).length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(stats.fileTypes).map(([type, count]) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type.toUpperCase()}: {count}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Upload Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <CardTitle className="text-base">Upload</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    accept=".pdf,.docx,.txt"
                  />
                  <Button
                    onClick={onUpload}
                    disabled={files.length === 0}
                    className="w-full"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {files.length > 0 && `(${files.length})`}
                  </Button>
                </CardContent>
              </Card>
            
              {/* Document List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Document Library</CardTitle>
                  <CardDescription>
                    {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadedDocuments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.chunksCount} chunks
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {doc.fileType.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            
              {/* AI Model Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AI Model</CardTitle>
                  <CardDescription>Choose the model for Q&A</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-mono">{selectedModel}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}