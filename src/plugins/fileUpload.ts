import { Elysia } from "elysia";

import { randomUUID } from "node:crypto";
import { resolve } from "path";
import { writeFile } from "fs/promises";

import { safeMethods } from "../../types/method.types";


import { fileTypeFromBlob } from "file-type";

const fileUploadDist = resolve(Bun.env.SERVER_PUBLIC); 

const uploadFilePlugin: Elysia = new Elysia()
.decorate('upload', {}) 
.onBeforeHandle(async ({ request, body, store }) => {
   if(safeMethods.includes(request.method)) return;

   // Если formData не пришла то не обрабатывать
   if(!request.headers.get('content-type')?.split(";").includes('multipart/form-data')) return;

   const files = [];

   for(let bodyField in body) {
      const bodyData = body[bodyField];

      const bodyDataIsBlob = bodyData instanceof Blob;


      if(!bodyDataIsBlob) continue;

      const bodyFileInDataExtension = await fileTypeFromBlob(bodyData),
      bodyGeneratedName = `${randomUUID()}.${bodyFileInDataExtension?.ext}`;
      
      files.push({
         field: bodyField,
         originalName: bodyData.name,
         filename: bodyGeneratedName,
         size: bodyData.size,
         destantion: fileUploadDist,
      });

      writeFile(resolve(fileUploadDist, bodyGeneratedName), new Buffer(await bodyData.arrayBuffer()));
   };

   // Если файл один то вернуть первый обьект массива файлов
   store.upload = files.length > 1 ? files: files[0];
})

export default uploadFilePlugin;