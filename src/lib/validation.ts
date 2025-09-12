export const VALID_MODELS = [
  'gpt-oss:20b',
  'gemma3:12b', 
  'gemma3:4b',
  'llama3.2:3b'
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_UPLOAD = 10;
export const MAX_QUESTION_LENGTH = 1000;

export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
} as const;

export function validateChatInput(question: string, model?: string) {
  if (!question || question.trim().length === 0) {
    throw new Error('Question is required');
  }
  
  if (question.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.`);
  }
  
  if (model && !VALID_MODELS.includes(model as typeof VALID_MODELS[number])) {
    throw new Error('Invalid model selected');
  }
  
  return question.trim();
}

export function validateFileUpload(file: File) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }
  
  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty.`);
  }
  
  // Check file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
  const isValidType = extension ? allowedExtensions.includes(extension) : false;
  
  if (!isValidType) {
    throw new Error(`File "${file.name}" has an unsupported format. Allowed: PDF, DOCX, TXT.`);
  }
  
  return true;
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.\./g, '_')
    .slice(0, 255); // Limit length
}