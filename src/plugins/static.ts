import { Elysia } from "elysia";
import { etag } from '@bogeychan/elysia-etag';

import { resolve } from "node:path";
import { exists, readFile, stat } from "node:fs/promises";

import { MimeType, fileTypeFromBuffer } from "file-type";
import responce from "../helpers/responce";


type Options = {
   path?: string;
   pathToPublicDir?: string;
   ignore?: string[];
};

const staticPlugin = ({
   path = '/public',
   pathToPublicDir = resolve("./public"),
   ignore = [".git", ".env", ".zip", ".gz", ".7z", ".s7z", ".apk", ".crt", ".key", ".pem", ".tar"],
}: Options) => new Elysia({
   prefix: path,
})
.decorate('staticPlugin', { pathToPublicDir, ignore })
.use(etag())
.get("/:filename", async ({ 
   params: { filename }, 
   set,
   staticPlugin: { pathToPublicDir, ignore }, 
   setETag,
   buildETagFor
}) => {
   
   if(!filename.split(".")[1]) return responce.failureWithError({
      set,
      error: {
         field: "filename",
         message: "У запрашиваемого файла обязательно должно быть его расширение!",
      },
   });

   if(ignore.includes(`.${filename.split(".")[1]}`)) return responce.failureNotFound({
      set,
      error: {
         field: "filename",
         message: "Такого файла не существует!",
      },
   })

   try {
      if(!(await exists(resolve(pathToPublicDir, filename)))) return responce.failureNotFound({
         set,
         error: {
            field: "filename",
            message: "Такого файла не существует!",
         },
      });

      
      const findFile = await readFile(resolve(pathToPublicDir, filename)),
      findFileMetadata = await stat(resolve(pathToPublicDir, filename));
      
      const {
         mime,
      } = await fileTypeFromBuffer(findFile);
      
      // Постановка E-tag на изображение
      setETag(buildETagFor(findFile));

      set.headers['Content-Type'] = (mime as MimeType);
      // set.headers['Content-Length'] = findFileMetadata.size.toString();
      // set.headers['Last-Modified'] = findFileMetadata.mtime.toString();
      
      set.status = 200;

      return new Blob([findFile], {
         type: mime,
      });
   }
   catch(err) {
      console.log(err);
      
      return;
   };
});

export default staticPlugin;