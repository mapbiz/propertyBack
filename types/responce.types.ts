import type { Context } from "elysia"; 

export type ResponceWithData<T = unknown> = Promise<{
   data: T;
   ok: boolean;
}>; 
export type ReponceWithoutData = ResponceWithData<null>; 
export type ResponceWithErrors<T = unknown> = {
   errors: Array<ErrorObject<T>>;
   ok: boolean;
};
export type ResponceWithError<T = unknown> = {
   error: ErrorObject<T>;
   ok: boolean;
};
export type ReponceWithReason = {
   reason: string;
   ok: boolean;
};

export type SetterResponce = Context['set'];

export enum HttpCodes {
   NOT_FOUND = 404,
   BAD_REQUEST = 400,
   SUCCESS = 200,
   CREATED = 201,
   NOT_CONTENT = 204,
};
export type StatusCodesSuccess = 200 | 201 | 204;
export type StatusCodesFailure = 400 | 404 | 403 | 500;
export type StatusCodes = StatusCodesSuccess | StatusCodesFailure;

export type ErrorObject<T = string> = {
   field: string;
   stack?: object;
   message: T;
};