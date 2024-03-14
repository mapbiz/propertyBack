import { Admin } from "../../db/entities/Admin";

import { randomUUID } from "node:crypto";

import orm from "../../db";

import { createPrompt, createSelection } from 'bun-promptx'

import colors from "colors";
(async () => {
   const login: string = createPrompt("Введите имя: ").value;

   let password;

   const generatePassword = createSelection([
      {
         text: "Да"
      },
      {
         text: "Нет"
      }
   ], 
   {
      headerText: "Генерировать пароль?"
   }
   );

   if(generatePassword.selectedIndex === 0) password = randomUUID();
   else password = createPrompt("Введите пароль: ").value;

   let resultedPassword = password;

   password = await Bun.password.hash(password, 'bcrypt');

   const newAdmin = new Admin({
      login,
      password,
   });

   await orm.persist([newAdmin]).flush();

   console.log(colors.green("Пользователь успешно создан"));

   console.log({ login, password: resultedPassword });

   return process.exit(1);
})();