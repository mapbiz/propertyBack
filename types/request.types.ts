import type { Context } from "elysia";

export type ElysiaRouteValidation<T = undefined, T1 = undefined, T2 = undefined> = {
   body: T;
   query: T1;
   params: T2;
};


export type CustomRequestParams<
   T = Context['body'], 
   TSet = Context['set'],
   TStore = Context['store'],
   TRequest = Context['request'], 
   TParams = Context['params'], 
   TQuery = Context['query'],
   TCookie = Context['cookie'],
   TPath = Context['path'],
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