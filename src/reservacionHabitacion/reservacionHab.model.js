import mongoose from "mongoose";

const ReservacionHabitacionSchema = mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registro',
        required: [true, "El id del usuario es obligatorio"]
    },
    idHabitacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habitacion',
        required: [true, "El id de la habitación es obligatorio"]
    },
    fechaInicio: {
        type: Date,
        required: [true, "La fecha de inicio es obligatoria"]
    },
    fechaFin: {
        type: Date,
        required: [true, "La fecha de fin es obligatoria"]
    },
    estadoReserva: {
        type: String,
        enum: ["RESERVADA", "PENDIENTE", "CANCELADA"],
        default: "PENDIENTE"
    },
    listaServiciosUtilizados: [{
        servicios: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hotel.serviciosAdicionales',
        },
        cantidad: {
            type: Number,
            required: [true, "La cantidad de servicios es obligatoria"]
        }
    }]
});

export default mongoose.model('ReservacionHabitacion', ReservacionHabitacionSchema);