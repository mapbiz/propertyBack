import type { Context } from "elysia";

export type File = {
   originalFileName: string;
   field: string;
   filename: string;
   size: number;

   reWriteFilename(newFilename: `${string}.${string}`,): void;
   readFile(): Promise<Buffer>;
   readFileSync(): Buffer;
   deleteFile(): void;
};

export type TempFile = Omit<File, 'filename' | 'reWriteFilename' | 'readFile' | 'readFileSync' | 'deleteFile'> & { file: Blob };


export type StoreUpload = { 
   upload?: {
      all: File | File[],
      [key: string]: File | File[],
   }, 
};