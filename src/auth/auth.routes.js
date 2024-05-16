import { Router } from "express";
import { check } from "express-validator";
import { login } from "./auth.controller.js";

const router = Router();

router.post('/login', [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6})
], login);

export default router;