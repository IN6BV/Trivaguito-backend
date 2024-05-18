import mongoose from "mongoose";

const ReservacionHabitacionSchema = mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registro',
    },
    idHabitacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habitacion',
    },
    fechaInicio: {
        type: Date,
    },
    fechaFin: {
        type: Date,
    },
    estadoReserva: {
        type: String,
        enum: ["RESERVADA", "PENDIENTE", "CANCELADA"],
        default: "PENDIENTE"
    },
    listaServiciosUtilizados: [{
        servicios: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hotel.serviciosAdicionales._id',
        }
    }],
    totalReserva: {
        type: Number,
    }
});

export default mongoose.model('ReservacionHabitacion', ReservacionHabitacionSchema);