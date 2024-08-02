import { Elysia, HTTPMethod } from "elysia";

import bearer from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { cookie } from '@elysiajs/cookie';
import { helmet } from 'elysia-helmet';

import staticPlugin from "./plugins/static.ts";
import serverLoggerPlugin from "./plugins/logger";
import uploadFilePlugin from "./plugins/fileUpload";
import authPlugin from "./plugins/auth.ts";

import apiRouter from "./routes/api.ts";
import authRouter from "./routes/auth.ts";

import responce from "./helpers/responce.ts";

import { uniqBy } from "./helpers/uniq.ts";

import colors from "colors";

const port: number = Number(Bun.env.SERVER_PORT!) || 8080;


const app = new Elysia({
   prefix: Bun.env.SERVER_BASE_PATH!,
   cookie: {
      sameSite: 'none',
      secure: true,
   },
   serve: {
     port: port,
   },
});

// Хенделинг
app.onError(({ error, code, set }) => {
   console.log(error);
   

   // Хенделинг ошибок веба
   switch(code) {
      case "NOT_FOUND":
      return responce.failureNotFound({ set, error: { field: "url", message: "Не найдено!" } });
      case "UNKNOWN":
         if(!!error?.error) 
            return responce.failureWithError({ 
               set, 
               error: {
                  field: error.error.path,
                  message: error.error.schema.error,
               }  
            });

         else return responce.failureWithReason({ set, reason: "Неизвестная ошибка!", statusCode: 500, });
      case "VALIDATION":
         if(error.all.findIndex(err => err.schema.anyOf?.length > 0) > -1) return responce.failureWithReason({
            set,
            statusCode: 400,
            reason: error.validator.schema.error,
         });

         return responce.failureWithErrors({ 
            set, 
            errors: uniqBy(
               error.all
               .map(err => {
                  return {
                     field: !err?.path ? 'body': err.path,
                     message: err.schema.error,
                  }
               })
               .filter(err => {
                  return !!err.field;
               }),
               'message',
            )
         });
   };

});


// Плагины
app.use(cors({
   origin: Bun.env.CORS_ORIGIN!,
   credentials: true,
   maxAge: Number(Bun.env.CORS_MAX_AGE!),
   allowedHeaders: Bun.env.CORS_ALLOWED_HEADERS!,
}))
app.use(cookie({
   secret: Bun.env.COOKIE_SECRET_CRYPTED!,
   sameSite: 'none',
   secure: true,
}));

app.use(bearer());
app.use(helmet());
app.use(jwt({
   name: "jwt",
   secret: "secret",
}))


// Собственные плагины
app.use(uploadFilePlugin);
app.use(serverLoggerPlugin);
app.use(authPlugin());
app.use(staticPlugin({}));


// Все пути с префиксами
app.use(apiRouter);
app.use(authRouter);



if(Bun.env.NODE_ENV !== 'development') { 
   console.log(colors.blue("Доступные пути:"));
   
   const colorMethod = (method: HTTPMethod) => {
      if(method === "GET") return colors.green(method);
      if(method === "POST") return colors.yellow(method);
      if(method === "DELETE") return colors.red(method); 
      if(method === "PATCH" || method === "PUT") return colors.blue(method);

      return colors.bgYellow(method);
   };

   app.routes.forEach(route => {
      console.log(colors.cyan(route.path), "-", colorMethod(route.method));
   });
}


app.listen(port, () => console.log(`Server run at: http://${app.server?.hostname}:${app.server?.port}${Bun.env.SERVER_BASE_PATH!}`));

export default app;
