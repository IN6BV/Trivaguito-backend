import { Router } from "express";
import { check } from "express-validator";
import { postHabitacion,
    getHabitaciones,
    getHabitacion,
    putHabitacion,
    deleteHabitacion,
    getHabitationsFromHotel
} from "./habitacion.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post(
    "/addHabitacion",
    [
        validarJWT,
        check("tipo", "El tipo es obligatorio").not().isEmpty(),
        check("cantidad", "La cantidad es obligatoria").not().isEmpty(),
        check("precio", "El precio es obligatorio").not().isEmpty(),
        check("fotosHabitacion", "Las fotos de la habitación son obligatorias").not().isEmpty(),
        check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    ], postHabitacion);

router.get("/getHabitaciones", validarJWT, getHabitaciones);
router.get("/getHabitationsFromHotel", validarJWT, getHabitationsFromHotel);
router.get("/getHabitacion/:id", validarJWT, getHabitacion);

router.put("/updateHabitacion/:id", validarJWT, putHabitacion);

router.delete("/deleteHabitacion/:id", validarJWT, deleteHabitacion);

export default router;