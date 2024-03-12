import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { appendFile, readFile } from "node:fs/promises";

import colors from "colors";

import { createSelection } from 'bun-promptx'

 
const prompts = async () => {
   const hasher = new Bun.CryptoHasher('sha512'); 

   const onlySecretsEnv = Object.keys(Bun.env)
   .filter(envKey => envKey.match("SECRET") && !envKey.match("CRYPTED"));

   const resultSecret = createSelection(onlySecretsEnv.map(secretEnv => {
      return {
         text: secretEnv,
         description: `Для шифровки`
      };
   }), {
      headerText: "Выберете env которые будут защифрованы",
   });
   const hashSecret = hasher.update(onlySecretsEnv[resultSecret.selectedIndex]);


   
   await appendFile(resolve("./", ".env"), `\n${onlySecretsEnv[resultSecret.selectedIndex]}_CRYPTED=${hashSecret.digest('base64')}`)

   console.log(colors.green(`Успешно создано ${onlySecretsEnv[resultSecret.selectedIndex]}_CRYPTED`));

   const returnable = createSelection([
      {
         text: "Да"
      },
      {
         text: "Нет"
      }
   ], {
      headerText: "Хотите защифровать снова?"
   });

   if(returnable.selectedIndex === 0) return await prompts();
   
   else return console.log("Конец работы генератора хешей!");
};

prompts();