import type { Context } from "elysia";

import type { ElysiaServerError, CustomRequestErrorParams } from "../../types/error.types";

import responce from "./responce";


export default (({ error, request, set }: CustomRequestErrorParams) => {
   switch(error.code) {
      case 'N'
   };
})