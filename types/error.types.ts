import type { ParseError, ValidationError, NotFoundError, InternalServerError, Context } from "elysia";

import type { CustomRequestParams } from "./request.types";
import type { HttpCodes } from "./responce.types";


export type ElysiaServerError = ParseError | ValidationError | NotFoundError | InternalServerError;

export type HttpErrorCodes = HttpCodes.BAD_REQUEST | HttpCodes.NOT_FOUND;

export interface ErrorRequest {
   code: HttpErrorCodes,
   status: string;
   message?: string;

   constructor(message: string, status: string, code: HttpCodes): void;
}

export abstract class ServerError implements ErrorRequest {
   code: HttpErrorCodes;
   status: string;
   message?: string;
   
   constructor(message: string, status: string, code: HttpErrorCodes) {
      this.message = message;
      this.status = status;
      this.code  = code;


      return;
   };
};


export type CustomRequestErrorParams<
   T = Context['body'], 
   TRequest = Context['request'], 
   TSet = Context['set'],
   TParams = Context['params'], 
   TQuery = Context['query'],
   TCookie = Context['cookie'],
   TPath = Context['path'],
   TStore = Context['store'],
> = {
   error: ElysiaServerError;
} & CustomRequestParams<T, TRequest, TSet, TParams, TQuery, TCookie, TPath, TStore>;