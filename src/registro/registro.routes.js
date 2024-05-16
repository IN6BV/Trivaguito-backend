import { Router } from "express";
import { check } from "express-validator";
import { postRegistro,
         getRegistros,
         getRegistro } from "./registro.controller.js";

const router = Router();

router.post('/registro', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('foto', 'La foto es obligatoria').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6})
], postRegistro);

router.get('/registros', getRegistros);

router.get('/registro/:id', getRegistro);

export default router;