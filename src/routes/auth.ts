import { Elysia, t } from "elysia";
import AuthController from "../controller/authController";

const router: Elysia = new Elysia({ prefix: 'auth' });

const controller: AuthController = new AuthController();

router
.post('/login', controller.login, {
    detail: {
        tags: ['Auth'],
        description: "test"
    }
})
.get('/exit', controller.exit)
.get('/me', controller.me);

export default router;