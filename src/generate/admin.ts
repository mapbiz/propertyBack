import { Admin } from "../../db/entities/Admin";

import { randomUUID } from "node:crypto";

import orm from "../../db";

import colors from "colors";

import inquirer from "inquirer";

(async () => {
   const questions = [
      {
         type: 'input',
         name: "name",
         message: "Введите имя:"
      },
      {
         type: 'input',
         name: "password",
         message: "Введите пароль:"
      }
   ];

   await inquirer.prompt(questions).then(async (answers: { name: string, password?: string }) => {
      let resultedPassword: string; 
      
      if(!answers.password) {
         resultedPassword = randomUUID();
         answers.password = resultedPassword;
      }
      else resultedPassword = answers.password;
      
      // hash pass on bcrypt
      resultedPassword = await Bun.password.hash(resultedPassword, 'bcrypt');

      const generateAdmin: Admin = new Admin({
         login: answers.name,
         password: resultedPassword,
      });

      await orm.persist([generateAdmin]).flush();

      console.log(colors.green("Пользователь успешно создан"));

      console.log({
         ...answers,
      });

      return process.exit(1);
   })   
})();
// (async () => {
//    const login: string = createPrompt("Введите имя: ").value;

//    let password;

//    const generatePassword = createSelection([
//       {
//          text: "Да"
//       },
//       {
//          text: "Нет"
//       }
//    ], 
//    {
//       headerText: "Генерировать пароль?"
//    }
//    );

//    if(generatePassword.selectedIndex === 0) password = randomUUID();
//    else password = createPrompt("Введите пароль: ").value;

//    let resultedPassword = password;

//    password = await Bun.password.hash(password, 'bcrypt');

//    const newAdmin = new Admin({
//       login,
//       password,
//    });

//    await orm.persist([newAdmin]).flush();

   // console.log(colors.green("Пользователь успешно создан"));

   // console.log({ login, password: resultedPassword });

//    return process.exit(1);
// })();