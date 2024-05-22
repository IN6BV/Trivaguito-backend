import { Router } from "express";
import { check } from "express-validator";
import { postRegistro,
        getRegistros,
        getRegistro,
        putRegistro,
        deleteRegistro,
        putUserAAdminHotel,
        listarUsuariosPorRol,
        getRegistroHoteles} from "./registro.controller.js";
import {validarJWT} from "../middlewares/validar-jwt.js";

const router = Router();

router.post('/add', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('foto', 'La foto es obligatoria').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6})
], postRegistro);

router.get('/', getRegistros);
router.get("/adminHotel", getRegistroHoteles)
router.get('byId/:id', getRegistro)
router.get('/byId/:id', getRegistro);

router.put('/update/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('foto', 'La foto es obligatoria').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('role', 'El role es obligatorio').not().isEmpty(),
    check('estado', 'El estado es obligatorio').not().isEmpty()
], putRegistro);

router.delete('/delete/:id', [
    validarJWT
    ], deleteRegistro);

router.put('/updateRole/:id', [
    validarJWT
], putUserAAdminHotel);

router.get('/byRole/:role', [
], listarUsuariosPorRol);
export default router;