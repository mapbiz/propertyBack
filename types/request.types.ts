import type { Context } from "elysia";

export type ElysiaRouteValidation<T = undefined, T1 = undefined, T2 = undefined> = {
   body: T;
   query: T1;
   params: T2;
};


export type CustomRequestParams<
   T = Context['body'], 
   TRequest = Context['request'], 
   TSet = Context['set'],
   TParams = Context['params'], 
   TQuery = Context['query'],
   TCookie = Context['cookie'],
   TPath = Context['path'],
   TStore = Context['store'],
> = {
   body: T,
   set: TSet,
   request: TRequest,
   params: TParams,
   query: TQuery,
   cookie: TCookie,
   path: TPath,
   store: TStore,
};