---
description: Configures and implements file upload handling in NexusAI's NestJS backend. Use when tasks involve setting up Multer, adding MIME validation, handling upload errors, wiring multipart endpoints, or serving static uploaded files.
---

# File Upload Handling Skill

## Use This Skill When

- Adding a new endpoint that accepts file uploads.
- Updating the existing Multer config in the `chat/` module.
- Adding MIME type restrictions or file size limits.
- Serving or referencing uploaded files in API responses.
- Handling file cleanup when a record is deleted.

## Multer Config Setup

The shared Multer configuration lives in `src/chat/upload.storage.ts`. Reuse it — do not create separate Multer configs per module unless the rules differ:

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
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

export const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? 'bin';
    cb(null, `${uuid()}.${ext}`);
  },
});

export const uploadFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type '${file.mimetype}' is not allowed`), false);
  }
};

export const uploadLimits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
  files: 10,
};
```

## Wiring Into a Controller

```ts
import { UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { uploadStorage, uploadFileFilter, uploadLimits } from './upload.storage';

// Multiple files (e.g. chat attachments)
@Post('message')
@UseInterceptors(FilesInterceptor('files', 10, {
  storage: uploadStorage,
  fileFilter: uploadFileFilter,
  limits: uploadLimits,
}))
sendMessage(
  @Body() dto: ChatMessageDto,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const attachments = files.map(f => ({
    url: `/uploads/${path.basename(f.path)}`,
    name: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
  }));
  return this.chatService.reply(dto.message, dto.context, attachments);
}

// Single file
@Post('avatar')
@UseInterceptors(FileInterceptor('avatar', {
  storage: uploadStorage,
  fileFilter: uploadFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}))
uploadAvatar(@UploadedFile() file: Express.Multer.File) {
  return { url: `/uploads/${path.basename(file.path)}` };
}
```

## Serving Static Files

Configure static serving once in `main.ts` — not per-module:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

Clients access files at: `GET /uploads/<uuid>.<ext>`

The frontend stores these relative URLs in the database — never absolute server paths.

## File Cleanup on Delete

When a chat message or session with attachments is deleted, clean up the files:

```ts
import * as fs from 'fs';
import * as path from 'path';

private deleteFile(relativePath: string): void {
  const uploadsBase = path.resolve(process.cwd(), 'uploads');
  const targetPath = path.resolve(process.cwd(), relativePath.replace(/^\//, ''));

  // Guard against path traversal
  if (!targetPath.startsWith(uploadsBase)) return;
  if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
}
```

Call this in the service for every attachment URL when the parent document is deleted.

## Frontend Sending Pattern

From `src/lib/api.ts` — do NOT set `Content-Type` manually on multipart requests:

```ts
export function apiChatMessage(
  message: string,
  context?: object,
  files?: File[],
) {
  const form = new FormData();
  form.append('message', message);
  if (context) form.append('context', JSON.stringify(context));
  files?.forEach(file => form.append('files', file));

  // Pass FormData as body — do NOT set Content-Type header
  return request<ChatReply>('/chat/message', { method: 'POST', body: form });
}
```

The `request<T>` utility must omit `Content-Type` when `body` is a `FormData` instance (the browser sets it automatically with the correct multipart boundary).

## Verification Checklist

- [ ] `fileFilter` rejects any MIME type not in the explicit whitelist.
- [ ] Filenames are UUIDs — never the original `file.originalname`.
- [ ] File size limit set to 10MB per file (or lower for specific endpoints).
- [ ] Static assets served via `app.useStaticAssets` with `/uploads/` prefix.
- [ ] Path traversal guard in the file deletion helper.
- [ ] Database stores `/uploads/<uuid>.<ext>` relative URLs — not absolute paths.
- [ ] Frontend `FormData` requests do not manually set `Content-Type`.
