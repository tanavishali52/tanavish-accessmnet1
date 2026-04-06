---
description: Configures file upload handling in NexusAI backend. Use when tasks involve Multer setup, MIME validation, multipart endpoints, serving static files, or cleaning up uploaded files on delete.
---

# File Upload Handling Skill

## Use This Skill When

- Adding a new endpoint that accepts file uploads.
- Updating the existing Multer config in `chat/upload.storage.ts`.
- Adding MIME type restrictions or file size limits.
- Serving or referencing uploaded files in API responses.
- Handling file cleanup when a parent record is deleted.

## Multer Config (reuse from `src/chat/upload.storage.ts`)

```ts
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/webm': 'webm',
  'application/pdf': 'pdf', 'text/plain': 'txt',
};

export const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? 'bin';
    cb(null, `${uuid()}.${ext}`);    // UUID filename — never use original name
  },
});

export const uploadFileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) cb(null, true);
  else cb(new BadRequestException(`File type '${file.mimetype}' is not allowed`), false);
};

export const uploadLimits = { fileSize: 10 * 1024 * 1024, files: 10 };
```

## Controller Wiring

```ts
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadStorage, uploadFileFilter, uploadLimits } from './upload.storage';
import * as path from 'path';

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
```

## Serving Static Files

Configure once in `main.ts`:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';
app.useStaticAssets(path.join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
```

Clients access files at `GET /uploads/<uuid>.<ext>`. Store only the relative URL in the database.

## File Cleanup on Delete

```ts
import * as fs from 'fs';
import * as path from 'path';

private deleteFile(relativePath: string): void {
  const base = path.resolve(process.cwd(), 'uploads');
  const target = path.resolve(process.cwd(), relativePath.replace(/^\//, ''));
  if (!target.startsWith(base)) return; // path traversal guard
  if (fs.existsSync(target)) fs.unlinkSync(target);
}
```

Call this for every attachment URL when the parent document is soft/hard deleted.

## Frontend Sending Pattern

From `src/lib/api.ts` — do NOT set `Content-Type` on multipart requests:

```ts
const form = new FormData();
form.append('message', message);
files?.forEach(f => form.append('files', f));
// Pass form directly — browser sets Content-Type with boundary automatically
return request<ChatReply>('/chat/message', { method: 'POST', body: form });
```

## Verification Checklist

- [ ] `fileFilter` rejects MIME types not in the explicit whitelist.
- [ ] Filenames are UUIDs — never `file.originalname`.
- [ ] File size limit enforced (10MB per file).
- [ ] Static assets served via `app.useStaticAssets` with `/uploads/` prefix.
- [ ] Path traversal guard in the file deletion helper.
- [ ] Database stores `/uploads/<uuid>.<ext>` relative URL — not the absolute path.
- [ ] Frontend does not manually set `Content-Type` on multipart requests.
