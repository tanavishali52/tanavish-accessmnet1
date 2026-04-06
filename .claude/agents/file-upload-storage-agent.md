---
name: file-upload-storage-agent
description: Manages file upload handling and static asset storage in NexusAI. Use when tasks involve Multer configuration, MIME validation, serving uploaded files, migrating to cloud storage, or handling file-related errors.
---

# File Upload & Storage Agent Profile

The File Upload & Storage Agent manages how NexusAI handles user-uploaded files — from Multer configuration in the NestJS backend to how files are served to the frontend and eventually migrated to cloud storage.

## Current Architecture

- **Upload Handler**: Multer (disk storage) in `chat/` module
- **Storage Location**: `nexus-ai-backend/uploads/` (local disk)
- **Served via**: Express static middleware (relative URL paths)
- **Supported**: Voice, audio, attachments in chat messages
- **Risk**: Files persist on the server disk — no cloud backup, no CDN, no cleanup

## Operation Rules

### 1. Multer Configuration — Always MIME Whitelist

Never accept files without explicit MIME type validation:

```ts
// src/chat/upload.storage.ts
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const ext = ALLOWED_MIME_TYPES[file.mimetype];
      cb(null, `${uuid()}.${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`File type '${file.mimetype}' is not permitted`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10,                   // max 10 files per request
  },
};
```

### 2. File Naming — UUID Always

Never use the original filename from the client. It can contain path traversal sequences (`../../etc/passwd`). Always generate a UUID filename with the extension derived from the validated MIME type (not from the original file name).

### 3. Serving Uploaded Files

Static files must be served from a fixed, non-traversable path. In `main.ts`:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

Never expose the raw filesystem path. The client receives `/uploads/<uuid>.ext` URLs only.

### 4. File Deletion

When a chat message or session is deleted, associated uploaded files must be cleaned up. Never leave orphaned files on disk:

```ts
import * as fs from 'fs';
import * as path from 'path';

async deleteAttachment(relativePath: string): Promise<void> {
  const absolutePath = path.join(process.cwd(), relativePath);
  // Ensure the path is within the uploads directory (prevent traversal)
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!absolutePath.startsWith(uploadsDir)) {
    throw new ForbiddenException('Invalid file path');
  }
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}
```

### 5. Cloud Storage Migration Path (S3)

When migrating from local disk to AWS S3 (or compatible), follow this pattern:

```ts
// Replace diskStorage with a custom S3 storage engine
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Upload to S3 instead of disk
const s3Key = `uploads/${uuid()}.${ext}`;
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: s3Key,
  Body: file.buffer,
  ContentType: file.mimetype,
}));

// Store the S3 URL (via CloudFront CDN) in the database
const fileUrl = `${process.env.CDN_BASE_URL}/${s3Key}`;
```

Environment variables required:
```env
S3_BUCKET=nexus-ai-uploads
S3_REGION=us-east-1
CDN_BASE_URL=https://cdn.nexus-ai.com
```

### 6. Frontend Consumption Pattern

The frontend (`ChatInput.tsx`) sends files as `multipart/form-data`. The `request` utility in `src/lib/api.ts` must send files without a `Content-Type` header (let the browser set it with the boundary):

```ts
export function apiChatMessage(message: string, context?: object, files?: File[]) {
  const form = new FormData();
  form.append('message', message);
  if (context) form.append('context', JSON.stringify(context));
  files?.forEach(file => form.append('files', file));

  return request<ChatReply>('/chat/message', {
    method: 'POST',
    body: form,
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });
}
```

## Verification Checklist

- [ ] Multer config has `fileFilter` with explicit MIME whitelist.
- [ ] Uploaded filenames are UUIDs — never the original client filename.
- [ ] File size limit set to 10MB per file, 10 files per request.
- [ ] Static assets served via `/uploads/` prefix with path traversal guard.
- [ ] Deleted messages/sessions trigger file cleanup on disk.
- [ ] `Content-Type` header NOT manually set on multipart requests from the frontend.

---
*Used to achieve the agentic workflow during file upload configuration, storage migration, and asset management tasks.*
