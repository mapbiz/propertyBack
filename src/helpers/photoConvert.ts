import { randomUUID } from "node:crypto";
import { resolve, parse } from "node:path";
import sharp, { Sharp } from "sharp";

import { fileUpload } from "./logger";

type ConvertOptions = {
   imageBuffer: Buffer;
   outPath?: string;
};
type ConvertResult = {
   generatedFileName: `${string}.webp`;
   sharpResult: Sharp;
};

export const convertToWebp = async ({
   imageBuffer,
   outPath = resolve(Bun.env.SERVER_PUBLIC!, `${randomUUID()}.webp`),
}: ConvertOptions): Promise<ConvertResult> => {
   return {
      generatedFileName: parse(outPath).base as `${string}.webp`,
      sharpResult: sharp(imageBuffer)
      .webp({
         quality: 100,
         preset: "photo",
      })
      .toFile(outPath, err => {
         fileUpload.error(`Ошибка при записи файла в: ${outPath}`, err);
      }),
   }
};