# Deployment Guide

## Containerization Strategy

The application uses a multi-container approach for production deployment with optimal separation of concerns.

### Container Architecture
```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Next.js App   │  │   Ollama Server  │  │  File Storage   │
│   (Port 3000)   │  │   (Port 11434)   │  │   (Volume)      │
│                 │  │                  │  │                 │
│ • Web Interface │  │ • AI Models      │  │ • Uploads       │
│ • API Routes    │  │ • Embeddings     │  │ • Vector DB     │
│ • File Upload   │  │ • Text Generation│  │ • Persistent    │
└─────────────────┘  └──────────────────┘  └─────────────────┘
```

## Docker Configuration

### Next.js App Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Ollama Container Setup
```dockerfile
FROM ollama/ollama:latest

RUN ollama serve & \
    sleep 10 && \
    ollama pull nomic-embed-text && \
    ollama pull gemma3:12b && \
    ollama pull llama3.2:3b && \
    ollama pull gemma3:4b && \
    ollama pull gpt-oss:20b

EXPOSE 11434
CMD ["ollama", "serve"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OLLAMA_HOST=ollama:11434
    volumes:
      - uploads:/app/uploads
      - vector-db:/app/data
    depends_on:
      - ollama

  ollama:
    build:
      context: .
      dockerfile: Dockerfile.ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  uploads:
  vector-db:
  ollama-models:
```

## Cloud Deployment

### AWS
```bash
# ECS with Fargate
aws ecs create-cluster --cluster-name rag-app
aws ecs create-service --cluster rag-app --service-name rag-service

# EC2 with GPU support for Ollama
aws ec2 run-instances --instance-type g4dn.xlarge
```

### Google Cloud Platform
```bash
# Cloud Run for App + Compute Engine for Ollama
gcloud run deploy rag-app --image gcr.io/project/rag-app
gcloud compute instances create ollama-server --machine-type n1-standard-4
```

### Digital Ocean
```bash
# App Platform + Droplet with GPU
doctl apps create --spec app-spec.yaml
doctl compute droplet create ollama-gpu --image ubuntu-20-04-x64 --size g-2vcpu-8gb
```

## Environment Variables

### Production Configuration
```bash
NODE_ENV=production
OLLAMA_HOST=ollama-server:11434
UPLOAD_MAX_SIZE=50MB
VECTOR_DB_PATH=/data/vector-db.json

# Security
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=100

# Storage
AWS_BUCKET_NAME=rag-app-uploads
AWS_REGION=us-east-1
```

## Kubernetes Deployment

### Helm Charts
- Package management for K8s deployment
- Horizontal Pod Autoscaling based on demand
- Ingress Controllers for load balancing and SSL
- Persistent Volumes for shared storage

### Monitoring
- Prometheus for metrics collection
- Grafana for visualization dashboards
- ELK Stack for centralized logging
- Health checks for application monitoring

## Security Enhancements

### Production Security
- HTTPS/TLS certificate management
- JWT-based user authentication
- Enhanced rate limiting
- Input sanitization and validation
- Container security scanning

## Getting Started

1. Install Docker from [docker.com](https://docker.com)
2. Clone repository and build:
   ```bash
   git clone <repo-url>
   cd doc-query-app
   docker-compose up --build
   ```
3. Access application at `http://localhost:3000`
4. Deploy to cloud using provider-specific guides above