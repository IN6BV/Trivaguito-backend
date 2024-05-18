import { Router } from "express";
import { check } from "express-validator";
import { postReservacionHab,
    getReservacionesHabi,
    getReservacionHab,
    cancelarReservacionHab,
    aceptarReservacionHab,
    getReservacionesHabUsuario,
    eliminarReservacionHab,
} from "./reservacionHab.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/:id", [
    validarJWT,
    check("fechaInicio", "La fecha de inicio es obligatoria").not().isEmpty(),
    check("fechaFin", "La fecha de fin es obligatoria").not().isEmpty(),
    check("listaServiciosUtilizados", "La lista de servicios utilizados es obligatoria").not().isEmpty(),
], postReservacionHab);

router.get("/obtenerReservaciones", getReservacionesHabi);

router.get("/obtenerReservacion/:id", getReservacionHab);

//mis reservaciones como usuario
router.get("/obtenerReservacionesUsuario", validarJWT, getReservacionesHabUsuario);

router.put("/cancelarReservacion/:id", validarJWT, cancelarReservacionHab);

router.put("/aceptarReservacion/:id", validarJWT, aceptarReservacionHab);

router.delete("/eliminarReservacion/:id", validarJWT, eliminarReservacionHab);

export default router;