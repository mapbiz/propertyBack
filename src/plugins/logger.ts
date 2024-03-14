import { Elysia } from "elysia";
import colors from "colors";

import { serverResponce, serverRequest, serverError, serverFatalError } from "../helpers/logger";

const colorsOfStatuses = (status?: number) => {
   if(!status) return status;

   const statusToString: string = String(status);

   switch(statusToString[0]) {
      case "2": 
         return colors.green(statusToString);
      case "3":
         return colors.blue(statusToString);
      case "4":
         return colors.red(statusToString);
      case "5":
         return colors.red(statusToString);
      default: 
         return colors.cyan(statusToString);
   };

},
colorsOfMethods = (method: string) => {
   switch(method) {
      case "GET":
         return colors.green(method);
      case "POST":
         return colors.yellow(method);
      case "PUT": 
         return colors.yellow(method);
      case "PATCH":
         return colors.blue(method);
      case "DELETE":
         return colors.red(method);
      case "OPTIONS":
         return colors.green(method);
      default:
         return colors.green(method);
   };
};

const serverLoggerPlugin = new Elysia()
.decorate('loggerPlugin', { serverResponce, serverRequest, serverError, serverFatalError })
.onError((params) => {
   const { code, error } = params;
   
   if(code !== 'VALIDATION' && !!code) {
      serverError.error(error, code);
      serverFatalError.fatal({ errorCodeOfElysia: code, errorStack: error});
   }
})
.onRequest(({ loggerPlugin: { serverRequest }, request, set: { status } }) => {
   serverRequest.info(`${request.url} ${colorsOfMethods(request.method)}  ${colorsOfStatuses(status)}`);
})
.onResponse(({ request, set: { status }, loggerPlugin: { serverResponce } }) => {
   serverResponce.info(`${ request.url } ${ colorsOfMethods(request.method) } ${colorsOfStatuses(status)}`);
});


export default serverLoggerPlugin;
