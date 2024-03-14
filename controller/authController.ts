import responce from "../src/helpers/responce";

import { Admin } from "../db/entities/Admin";
import orm from "../db";
import { setAuth, validAuth } from "../src/helpers/authJwt";

import { compare } from "bcrypt-ts";

export default class AuthController {
   async login({ set, body, cookie, setCookie, removeCookie, jwt }) {
      try {
         if(!!cookie.auth) return responce.failureWithReason({
            reason: "Сначала выйдете!",
            set,
         })

         const findAdminByLogin = await orm.findOne(Admin, {
            login: body.login,
         }, {
            exclude: ['createdAt', 'updatedAt'],
         });

         if(findAdminByLogin === null) {
            return responce.failureWithError({
               set,
               statusCode: 403,
               error: {
                  field: "login",
                  message: "Проверьте ввод логина!"
               }
            })
         };


         const verifyPassword = await Bun.password.verify(body.password, findAdminByLogin.password);
         
         if(!verifyPassword) return responce.failureWithError({
            set,
            statusCode: 403,
            error: {
               field: "password",
               message: "Проверьте правильность ввода пароля!"
            },
         })

         await setAuth({ userData: { id: findAdminByLogin.id, login: findAdminByLogin.login,  }, cookie: { cookie, setCookie, removeCookie }, jwt });


         return responce.successWithData({
            set,
            data: {
               message: "Успешный вход"
            },
         })
      }
      catch(err) {
         console.log(err);
      };
   }; 

   async exit({ set, cookie, removeCookie }) {
      removeCookie('auth');

      return responce.successWithData({
         set, 
         data: "Вы успешно вышли!"
      })
   };

   async me({ set, cookie, setCookie, removeCookie, jwt }) {
      try {
         
         const validUser = await validAuth({ cookie: { cookie, setCookie, removeCookie }, jwt });
      

         if(!validUser.auth) return responce.failureWithReason({
            set,
            statusCode: 401,
            reason: "Неавторизован!",
         })

         return responce.successWithData({
            set,
            data: validUser,
         })
      }
      catch(err) {
         console.log(err);
      }
   };
};