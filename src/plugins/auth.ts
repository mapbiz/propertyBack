import bearer from "@elysiajs/bearer";
import { Elysia } from "elysia";

const AuthPlugin = new Elysia()
.use(bearer())
.decorate("auth", {})
.onRequest(({ request, headers, set }) => {
   console.log(request);
}); 
// .onRequest(({ set, request, body, headers }) => {

// });

export default AuthPlugin