import type { Context } from "elysia";
import type { StoreUpload, File } from "./fileUpload.types";
import type { CustomRequestParams } from "./request.types"; 

import { Images } from "../db/entities/Images";

export type Tenant = {
   name: string; 
   category: string;
   logo: Images;
};

export type TenantCreateNewRequest = Pick<
   CustomRequestParams<
      Omit<Tenant, 'logo'> & { logo: Blob },
      Context['set'],
      StoreUpload
   >,
   'body' | 'store' | 'set' 
>