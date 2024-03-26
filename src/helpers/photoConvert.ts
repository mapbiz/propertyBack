import { randomUUID } from "node:crypto";
import { resolve, parse } from "node:path";
import sharp, { Sharp } from "sharp";

import { fileUpload } from "./logger";

type ConvertOptions = {
   imageBuffer: Buffer;
   extension: string;
   outPath?: string;
};
type ConvertResult = {
   generatedFileName: `${string}.${string}`;
   createdFilePath: string;
   sharpResult: Sharp;
};

export const convertToWebp = async ({
   imageBuffer,
   extension,
   outPath = resolve(Bun.env.SERVER_PUBLIC!, `${randomUUID()}.${extension}`),
}: ConvertOptions): Promise<ConvertResult> => {
   return {
      generatedFileName: parse(outPath).base as `${string}.${string}`,
      createdFilePath: outPath,
      sharpResult: sharp(imageBuffer)
      // .webp({
      //    quality: 100,
      //    preset: "photo",
      // })
      .toFile(outPath, err => {
         fileUpload.error(`Ошибка при записи файла в: ${outPath}`, err);
      }),
   }
};