import { Router } from "express";
import { check } from "express-validator";
import { postHotel,
        getHotels,
        getHotel,
        putHotel,
        putAddServiciosAdicionales,
        deleteHotel,
        getHotelByReservations,
        getAllReservationsFromHotel,
        getAllUsersWithReservationsInHotel,
} from "./hotel.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post('/addHotel', [
    validarJWT,
    check('nombreHotel', 'El nombre del hotel es obligatorio').not().isEmpty(),
    check('direccion', 'La dirección del hotel es obligatoria').not().isEmpty(),
    check('categoria', 'La categoría es obligatoria').not().isEmpty(),
    check('rangoPrecios', 'El rango de precios es obligatorio').not().isEmpty(),
    check('comodidades', 'Las comodidades son obligatorias').not().isEmpty(),
    check('fotosHotel', 'Las fotos del hotel son obligatorias').not().isEmpty(),
    check('serviciosAdicionales', 'Los servicios adicionales son obligatorios').not().isEmpty(),
], postHotel);
router.get('/getHotelsForReport', getHotelByReservations)
router.get('/', getHotels);

router.get('/byId/:id', getHotel);
router.get('/getHotelReservations', [validarJWT], getAllReservationsFromHotel)
router.get('/getAllUsersWithReservationsInHotel', [validarJWT], getAllUsersWithReservationsInHotel)
router.put('/updateHotel/:id', [
    validarJWT,
    check('nombreHotel', 'El nombre del hotel es obligatorio').not().isEmpty(),
], putHotel);

router.put('/addServiciosAdicionales/:id', [
    validarJWT,
    check('nombre', 'El nombre del servicio adicional es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción del servicio adicional es obligatoria').not().isEmpty(),
    check('precio', 'El precio del servicio adicional es obligatorio').not().isEmpty(),
], putAddServiciosAdicionales);

router.delete('/deleteHotel/:id', validarJWT, deleteHotel)

export default router;