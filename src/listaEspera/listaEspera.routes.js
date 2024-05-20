import { Router } from "express";
import { check } from "express-validator";
import {
    postListaEspera,
    getListaEspera
} from "./listaEspera.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post('/add', [
    validarJWT
], postListaEspera);

router.get('/gets', [
], getListaEspera);
export default router;