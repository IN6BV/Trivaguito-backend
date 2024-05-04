import mongoose from "mongoose";

const EventosSchema = mongoose.Schema({
    idHotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: [true, "El id del hotel es obligatorio"]
    },
    nombreEvento: {
        type: String,
        required: [true, "El nombre del evento es obligatorio"]
    },
    fechaEvento: {
        type: Date,
        required: [true, "La fecha del evento es obligatoria"]
    },
    horaEvento: {
        type: String,
        required: [true, "La hora del evento es obligatoria"]
    },
    listaServiciosUtilizados: {
        servicios: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hotel.serviciosAdicionales',
        },
        cantidad: {
            type: Number,
            required: [true, "La cantidad de servicios es obligatoria"]
        }
    }
});

export default mongoose.model('Eventos', EventosSchema);