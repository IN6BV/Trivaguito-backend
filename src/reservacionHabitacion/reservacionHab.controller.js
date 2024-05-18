import ReservacionHab from "./reservacionHab.model.js";
import Registro from "../registro/registro.model.js";
import Habitacion from "../habitacion/habitacion.model.js";
import Hotel from "../hotel/hotel.model.js";

const convertirFecha = (fecha) => {
    const [dia, mes, año] = fecha.split('/');
    return new Date(`${año}-${mes}-${dia}`);
};

export const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
    const unDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const inicio = convertirFecha(fechaInicio);
    const fin = convertirFecha(fechaFin);

    const diferenciaEnMilisegundos = fin - inicio;
    const diferenciaEnDias = Math.round(diferenciaEnMilisegundos / unDia);

    return diferenciaEnDias;
};

export const postReservacionHab = async (req, res) => {
    const { id } = req.params;
    const usuario = req.user.email;

    const user = await Registro.findOne({ email: usuario });
    const habitacion = await Habitacion.findById(id);

    if (habitacion.estado === false) {
        return res.status(400).json({
            msg: "La habitación no está disponible"
        });
    } else {
        const { fechaInicio, fechaFin, listaServiciosUtilizados } = req.body;

        const dias = calcularDiasEntreFechas(fechaInicio, fechaFin);

        let totalReserva = dias * habitacion.precioPorNoche;

        const serviciosUtilizadosIds = listaServiciosUtilizados.split(',');

        const hotel = await Hotel.findOne({
            'serviciosAdicionales._id': { $in: serviciosUtilizadosIds }
        });

        if (!hotel) {
            return res.status(404).json({
                msg: "El hotel no tiene los servicios adicionales especificados"
            });
        }

        const serviciosUtilizados = serviciosUtilizadosIds.map(servicioId => {
            const servicio = hotel.serviciosAdicionales.find(s => s._id.toString() === servicioId);
            if (servicio) {
                totalReserva += dias * servicio.precio;
            }
            return {
                servicios: servicioId
            };
        });

        const newReservacionHab = new ReservacionHab({
            idUsuario: user._id,
            idHabitacion: habitacion._id,
            fechaInicio: convertirFecha(fechaInicio),
            fechaFin: convertirFecha(fechaFin),
            listaServiciosUtilizados: serviciosUtilizados,
            totalReserva: totalReserva
        });

        await newReservacionHab.save();

        habitacion.estado = false;
        await habitacion.save();

        res.status(201).json({
            msg: "Reservación registrada con éxito, ahora no se puede modificar nada, si desea cancelarla, comuníquese con el hotel",
            newReservacionHab
        });
    }
};

export const getReservacionesHabi = async (req, res) => {
    const reservaciones = await ReservacionHab.find();
    res.json({
        reservaciones
    });
};

export const getReservacionHab = async (req, res) => {
    const { id } = req.params;
    const reservacion = await ReservacionHab.findById(id);
    res.json({
        reservacion
    });
};

//solo administradores de hoteles

export const cancelarReservacionHab = async (req, res) => {
    const { id } = req.params;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({ email: adminHotel });
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (hotel) {
        const reservacion = await ReservacionHab.findById(id);

        if (reservacion) {
            const habitacion = await Habitacion.findById(reservacion.idHabitacion);

            if (habitacion) {
                habitacion.estado = true;
                await habitacion.save();
            }

            await ReservacionHab.findByIdAndDelete(id);

            res.json({
                msg: "Reservación cancelada con éxito"
            });
        } else {
            res.status(404).json({
                msg: "No se encontró la reservación"
            });
        }
    }
}

//solo administradores de hoteles
export const aceptarReservacionHab = async (req, res) => {
    const { id } = req.params;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({ email: adminHotel });
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (hotel) {
        const reservacion = await ReservacionHab.findById(id);

        if (reservacion) {
            reservacion.estadoReserva = "RESERVADA";
            await reservacion.save();

            res.json({
                msg: "Reservación aceptada con éxito"
            });
        } else {
            res.status(404).json({
                msg: "No se encontró la reservación"
            });
        }
    } else {
        res.status(400).json({
            msg: "No se encontró el hotel"
        });
    }

}

//mis reservaciones
export const getReservacionesHabUsuario = async (req, res) => {
    const usuario = req.user.email;

    const user = await Registro.findOne({ email: usuario });

    const reservaciones = await ReservacionHab.find({ idUsuario: user._id });
    res.json({
        reservaciones
    });
};

//solo administradores de hoteles
export const eliminarReservacionHab = async (req, res) => {
    const { id } = req.params;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({ email: adminHotel });
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (hotel) {
        await ReservacionHab.findByIdAndDelete(id);
        res.json({
            msg: "Reservación eliminada con éxito"
        });
    } else {
        res.status(400).json({
            msg: "No se encontró el hotel"
        });
    }
}


