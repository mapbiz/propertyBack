import { Elysia } from "elysia";

import { Admin } from "../../db/entities/Admin";
import orm from "../../db";

import responce from "../helpers/responce";

import { validAuth } from "../helpers/authJwt";

type OptionsAuthPlugin = {
   unsafeMethods?: string[];
};

const authPlugin = () => new Elysia()
.decorate("auth", {})
.onBeforeHandle(async ({ set, request, path, cookie, setCookie, removeCookie, jwt }) => {
   if(path === '/auth/login') return;

   if(!["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) return;
   
   
   const validUser = await validAuth({ cookie: { cookie, setCookie, removeCookie }, jwt });

   if(!validUser.auth) return responce.failureWithReason({
      set,
      statusCode: 401,
      reason: "Вы неавторизованны",
   });
})


export default authPlugin;