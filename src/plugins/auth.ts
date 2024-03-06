import { Elysia } from "elysia";


const authPlugin = "";

// type AuthParametrs = {
//    protectedRoutes: Array<string>;
//    unsafeMethods?: Array<string>;
// };

// class AuthPlugin extends Elysia {
//    public protectedRoutes: Array<string>;
//    public unsafeMethods: Array<string>;

//    constructor({
//       protectedRoutes, 
//       unsafeMethods=["POST", "PUT", "PATCH", "DELETE"],
//    }: AuthParametrs) {
//       super();

//       this.protectedRoutes = protectedRoutes;
//       this.unsafeMethods = unsafeMethods;

//       this.decorate("auth", {});
//       this.onBeforeHandle(({ request, headers }) => {
//          if(!this.unsafeMethods.includes(request.method)) return;

//          console.log({ request, methods, headers });
//       });
//    };


// };

export default authPlugin;