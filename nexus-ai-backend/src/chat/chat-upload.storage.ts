import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

/** Root for chat uploads, served at `/uploads` (see `ServeStaticModule`). */
export const CHAT_UPLOADS_ROOT = join(process.cwd(), 'public', 'uploads');

function subdirForMime(mimetype: string): 'voice' | 'images' | 'files' {
  if (mimetype.startsWith('audio/')) return 'voice';
  if (mimetype.startsWith('image/')) return 'images';
  return 'files';
}

function extFromMime(mimetype: string): string {
  const m = mimetype.toLowerCase();
  if (m.includes('webm')) return '.webm';
  if (m.includes('ogg')) return '.ogg';
  if (m.includes('mpeg') || m.includes('mp3')) return '.mp3';
  if (m.includes('wav')) return '.wav';
  if (m.includes('png')) return '.png';
  if (m.includes('jpeg') || m.includes('jpg')) return '.jpg';
  if (m.includes('gif')) return '.gif';
  if (m.includes('webp')) return '.webp';
  return '';
}

export function chatFilesMulterOptions() {
  return {
    storage: diskStorage({
      destination: (_req, file, cb) => {
        const sub = subdirForMime(file.mimetype);
        const dir = join(CHAT_UPLOADS_ROOT, sub);
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const fromName = extname(file.originalname);
        const ext = fromName || extFromMime(file.mimetype);
        const base = `${Date.now()}-${randomBytes(8).toString('hex')}`;
        cb(null, ext ? `${base}${ext}` : base);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  };
}
