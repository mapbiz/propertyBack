import { generateKeyPairSync } from "node:crypto";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";


import colors from "colors";

try {
   console.log(colors.yellow("Начало генерации ключей!"));

   const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
   })

   console.log(colors.green("Ключи успешно сгенерированы \n Подождите они сохраняются..."));

   writeFileSync(resolve("./publicKey.key"), publicKey);
   console.log(colors.green("Public key: ✓"));

   writeFileSync(resolve("./privateKey.key"), privateKey);
   console.log(colors.green("Private key: ✓"));

   console.log(colors.green("Ключи успешно созданы"));
}
catch(err) {
   console.log(err);

   console.log(colors.red("Ошибка при создании ключей"));
}