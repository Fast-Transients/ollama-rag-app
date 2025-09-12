# API Documentation

## Upload Endpoint

**POST** `/api/upload`

### Request
- Content-Type: multipart/form-data
- Body: FormData with "files" field containing File objects

### Response
```json
{
  "message": "Files uploaded and processed successfully.",
  "stats": {
    "chunksCreated": 25,
    "totalChunks": 125,
    "totalFiles": 5
  }
}
```

### Error Responses
```json
{
  "error": "File too large. Maximum 50MB."
}
```

### Rate Limits
- 10 requests per 15 minutes per client
- Returns 429 status with Retry-After header when exceeded

## Chat Endpoint

**POST** `/api/chat`

### Request
```json
{
  "question": "What is the vacation policy?",
  "model": "gemma3:12b"
}
```

### Response
```json
{
  "answer": "According to the employee handbook...",
  "sources": [
    {
      "text": "Employees are entitled to 15 days...",
      "fileName": "employee-handbook.pdf",
      "similarity": "0.89"
    }
  ]
}
```

### Error Responses
```json
{
  "error": "Question is required"
}
```

### Rate Limits
- 20 requests per minute per client
- Returns 429 status with Retry-After header when exceeded

## Models

### Available Models
- `gemma3:12b` (default) - Balanced performance
- `gpt-oss:20b` - Highest quality
- `gemma3:4b` - Good quality, faster
- `llama3.2:3b` - Fastest responses

### Model Requirements
All models must be downloaded via Ollama before use:
```bash
ollama pull <model-name>
```