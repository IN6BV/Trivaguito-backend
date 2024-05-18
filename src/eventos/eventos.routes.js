import { Router } from "express";
import { check } from "express-validator";
import { postEvento,
    getEventos,
    getEvento,
    eliminarEvento
} from "./eventos.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/agendar", [
    validarJWT,
    check("nombreEvento", "El nombre del evento es obligatorio").not().isEmpty(),
    check("fechaHoraEvento", "La fecha y hora del evento es obligatoria").not().isEmpty(),
    check("listaServiciosUtilizados", "La lista de servicios utilizados es obligatoria").not().isEmpty(),
], postEvento);

router.get("/obtenerEventos", getEventos);

router.get("/obtenerEvento/:id", getEvento);

//solo admins
router.delete("/eliminarEvento/:id", validarJWT, eliminarEvento);

export default router;