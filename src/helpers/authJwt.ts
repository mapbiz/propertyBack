import { JWTOption, JWTPayloadSpec } from "@elysiajs/jwt";
import { Admin } from "../../db/entities/Admin";
import { Session } from "elysia-session/src/session";
import { CookieOptions, CookieRequest } from "@elysiajs/cookie";

import orm from "../../db";

type SetAuthParams = {
   userData: Admin,
   cookie: CookieRequest,
   jwt: { 
      async sign(payload: JWTPayloadSpec): Promise<string>
   },
};

export const setAuth = async ({ userData, cookie, jwt }: SetAuthParams) => {
   const jwtAuthData = await jwt.sign(JSON.stringify({ auth: true, ...userData }));

   cookie.setCookie('auth', jwtAuthData);
};
export const validAuth = async ({ cookie, jwt }: Omit<SetAuthParams, 'userData'>) => {
   const authCookie = cookie.cookie.auth;

   const authDataBeforeSerilization = await jwt.verify(authCookie);

   if(!authDataBeforeSerilization) return {
      auth: false,
   }

   const authData = JSON.parse(Object.values(authDataBeforeSerilization).join(""));   

   return authData;
};