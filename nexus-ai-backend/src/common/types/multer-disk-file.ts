/** Shape of files from Multer disk storage (matches `dest` + `FilesInterceptor`). */
export type MulterDiskFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
};
