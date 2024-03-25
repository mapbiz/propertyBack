import { readdir } from "fs/promises";
import { resolve } from "node:path";

import sharp from "sharp";

import { Images } from "../../db/entities/Images";
import orm from "../../db";

import colors from "colors";
import { readFile } from "fs/promises";
import { wrap } from "@mikro-orm/core";
import { rm } from "fs/promises";

(async () => {
   const getAllImagesInFS = (await readdir(resolve(Bun.env.SERVER_PUBLIC!)))
   .filter(filename => filename.split(".")[1] !== 'webp' && filename.split(".")[1] !== "svg" && filename.split(".")[1] !== 'ico'); 

   if(getAllImagesInFS.length === 0) {
      console.log(colors.red("Нет ни одного файла для конвертации!"));

      return process.exit();
   }

   const overedFiles: { success: boolean, file: string }[] = await Promise.all(getAllImagesInFS.map(async (file) => {
      try {
         console.log(colors.yellow(`Работа над файлом ${file} начата!`));

         const renameFilePath = resolve(Bun.env.SERVER_PUBLIC!, file),
         renameFileInDB: Images | null = await orm.findOne(Images, {
            url: file,
         });
         
         const renameFile: Buffer = await readFile(renameFilePath);
         
         console.log(colors.green(`Файл ${file} успешно найден в файловой системе!`));
         console.log(
            renameFileInDB === null ? colors.yellow(`Файл ${file} не найден в дб, работа с ним продолжиться только в файловой системе`): 
            colors.green(`Файл ${file} успешно найден в бд!`),
         )
            
         console.log(colors.green(`Файл ${file} найден идет конвертация в webp`));

         sharp(renameFile)
         .webp({
            quality: 100,
            preset: "photo",
         })
         .toFile(resolve(Bun.env.SERVER_PUBLIC!, `${file.split(".")[0]}.webp`));

         console.log(colors.green(`Файл ${file} успешно сконвертирован в webp!`));
         console.log(colors.yellow(`Начинается удаление старого ${file}`));

         // Удаление старого файла
         rm(renameFilePath);

         console.log(colors.green(`Успешное удаление старого файла!`))

         if(renameFileInDB !== null) {
            console.log(colors.green(`Работа над ${file} в дб, началась`));

            wrap(renameFileInDB).assign({
               url: `${file.split(".")[0]}.webp`,
            }, { em: orm });

            await orm.flush();

            console.log(colors.green(`Работа над ${file} в дб, закончена!`));
         }
         console.log(colors.green(`Работа над файлом ${file.split(".")[0]} закончена!`));

         return {
            success: true,
            file,
         };
      }
      catch(err) {
         console.log(colors.red(`Конвертация файла ${file}, закончилась с ошибкой: ${err}`));
         
         return {
            success: false,
            file, 
         };
      }; 
   }));

   overedFiles.filter(overFile => !!overFile.success).length > 0 ? 
   console.log(colors.green(`Успешно сконветированных файлов: ${overedFiles.filter(overFile => !!overFile.success).length}`)):
   null;

   overedFiles.filter(overFile => !overFile.success).length > 0 ? 
   console.log(colors.red(`Провальные файлы ${overedFiles.filter(overFile => !overFile.success).length}`)):
   null;

   return process.exit();
})();