import { Elysia } from "elysia";

import responce from "../helpers/responce";

import { validAuth } from "../helpers/authJwt";

const archivePaths = ['/api/v1/objects/archive'];

const authPlugin = () => new Elysia()
.decorate("auth", {})
.onBeforeHandle(async ({ set, request, path, cookie, setCookie, removeCookie, jwt }) => {
   if(path === `${Bun.env.SERVER_BASE_PATH!}/auth/login`) return;   

   if(!["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && !archivePaths.includes(path)) return;
   
   const validUser = await validAuth({ cookie: { cookie, setCookie, removeCookie }, jwt });

   if(!validUser.auth) return responce.failureWithReason({
      set,
      statusCode: 401,
      reason: "Вы неавторизованны",
   });
})


export default authPlugin;