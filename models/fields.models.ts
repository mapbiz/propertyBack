import { t } from "elysia";


export const NormalNumeric = (options: typeof t.String) => t.String({
   format: 'numeric',
   ...options,
});