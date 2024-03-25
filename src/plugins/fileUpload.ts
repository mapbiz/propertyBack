import { Elysia, Context } from "elysia";

import { randomUUID } from "node:crypto";
import { resolve } from "path";
import { readFileSync } from "node:fs";
import { writeFile, rename, rm, readFile } from "fs/promises";

import { safeMethods } from "../../types/method.types";
import type { TempFile, File } from "../../types/fileUpload.types"; 

import { fileTypeFromBlob } from "file-type";
import { convertToWebp } from "../helpers/photoConvert";

const fileUploadDist = resolve(Bun.env.SERVER_PUBLIC!); 

const uploadFilePlugin: Elysia = new Elysia()
.decorate('upload', {}) 
.onBeforeHandle(async ({ request, body, store }) => {
   if(safeMethods.includes(request.method)) return;

   // Если formData не пришла то не обрабатывать
   if(!request.headers.get('content-type')?.split(";").includes('multipart/form-data')) return;

   const filesBlobs: TempFile[] = [];


   store.upload = {
      all: {},
   };

   for(let bodyField in body) {
      const bodyData = body[bodyField];

      if(bodyData instanceof Blob) {
         filesBlobs.push({
            file: bodyData,
            field: bodyField,
            originalFileName: bodyData.name,
            size: bodyData.size,
         });
      };

      if(Array.isArray(bodyData)) {
         for(let nestedBodyField of bodyData) {
            

            if(nestedBodyField instanceof Blob) {
               filesBlobs.push({
                  file: nestedBodyField,
                  field: bodyField,
                  originalFileName: nestedBodyField.name,
                  size: nestedBodyField.size,
               });
            }
         };
      }; 

   };

   const uploadedImages: File[] = await Promise.all(filesBlobs.map(async (fileBlob) => {
      const extensionOfFIle = await fileTypeFromBlob(fileBlob.file),
      generateFileName = `${randomUUID()}.webp`;
      
      let createFilePath = resolve(fileUploadDist, generateFileName);

      //const createdFile = await writeFile(createFilePath, new Buffer(await fileBlob.file.arrayBuffer()));
      const { generatedFileName } = await convertToWebp({
         imageBuffer: new Buffer(await fileBlob.file.arrayBuffer()),
      });

      const resultFile: File = {
         originalFileName: fileBlob.originalFileName,
         field: fileBlob.field,
         filename: generatedFileName,
         size: fileBlob.size, 
         reWriteFilename(newFilename) {
            rename(createFilePath, resolve(fileUploadDist, newFilename));
            
            createFilePath = resolve(fileUploadDist, newFilename);

            this.filename = newFilename;
         },
         deleteFile() {
            rm(createFilePath)
         },
         async readFile() {
            return await readFile(createFilePath);
         },
         readFileSync() {
            return readFileSync(createFilePath);
         },
      };

      return resultFile;
   }));

   // @ts-ignore
   store.upload.all = uploadedImages.length > 1 ? uploadedImages: uploadedImages[0];

   let fieldsStore: {
      [key: string]: File[],
   } = {};
   
   uploadedImages.forEach(uploadImage => {
      if(Array.isArray(fieldsStore[uploadImage.field])) fieldsStore[uploadImage.field].push(uploadImage);
      else fieldsStore[uploadImage.field] = [uploadImage];
   });

   for(let field in fieldsStore) {
      const currentField = fieldsStore[field];

      if(currentField.length === 1) fieldsStore[field] = currentField[0];
   };

   store.upload = {
      ...store.upload,
      ...fieldsStore,
   };
   
})

export default uploadFilePlugin;