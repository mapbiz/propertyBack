import type { 
   ResponceWithData, 
   ReponceWithReason,
   ResponceWithError,
   ReponceWithoutData,
   ResponceWithErrors,
   SetterResponce, 
   StatusCodes, 
   
   ErrorObject,
} from "../../types/responce.types";


export type DataParams<T = unknown> = { 
   set: SetterResponce;
   data: T;
   statusCode?: StatusCodes;
};
export type WithoutDataParams = Omit<DataParams<never>, "data">;

export type ErrorsParams<T = string | unknown> = {
   errors: Array<ErrorObject<T>>,
} & WithoutDataParams;
export type ErrorParams<T = string | unknown> = {
   error: ErrorObject<T>,
} & WithoutDataParams;

export type ReasonParam = {
   reason: string;
} & WithoutDataParams;

export default {
   successCreated: {
      withData<T>({ set, data, statusCode = 201 }: DataParams<T>): ResponceWithData<T> {
         set.status = statusCode;

         return {
            ok: true,
            data,
         };
      },
      withoutData({ set, statusCode = 201 }: WithoutDataParams): ReponceWithoutData {
         set.status = statusCode;
         
         return {
            ok: true,
            data: null,
         };
      }
   },
   successWithData<T>({ set, data, statusCode = 200 }: DataParams<T>): ResponceWithData<T> {
      set.status = statusCode;

      return {
         ok: true,
         data,
      };
   },
   successWithoutData({ set, statusCode = 204 }: Omit<DataParams<never>, 'data'>): ReponceWithoutData {
      set.status = statusCode;

      return {
         ok: true,
         data: null,
      };
   },

   failureWithErrors<T = unknown>({ set, errors, statusCode = 400 }: ErrorsParams<T>): ResponceWithErrors<T> {
      set.status = statusCode;
            

      return {
         ok: false,
         errors,
      };
   },
   failureWithReason({ set, reason, statusCode = 400 }: ReasonParam): ReponceWithReason {
      set.status = statusCode;

      return {
         ok: false,
         reason,
      };
   },
   failureWithError<T>({ set, statusCode = 400, error }: ErrorParams<T>): ResponceWithError<T> {
      set.status = statusCode;

      return {
         ok: false,
         error,
      }
   },
   failureNotFound({ set, error, statusCode = 404 }: ErrorParams<string>): ResponceWithError<string> {
      set.status = statusCode;

      return {
         ok: false,
         error
      };
   },
};