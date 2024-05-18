import mongoose from "mongoose";

const EventosSchema = mongoose.Schema({
    idOrganizador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registro',
    },
    nombreEvento: {
        type: String,
        required: [true, "El nombre del evento es obligatorio"]
    },
    fechaHoraEvento: {
        type: Date,
        required: [true, "La fecha del evento es obligatoria"]
    },
    listaServiciosUtilizados: [{
        servicios: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hotel.serviciosAdicionales._id',
        },
        cantidad: {
            type: Number,
        }
    }],
    totalEvento: {
        type: Number,
    }
});

export default mongoose.model('Eventos', EventosSchema);