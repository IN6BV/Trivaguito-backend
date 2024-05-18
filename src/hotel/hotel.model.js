import mongoose from "mongoose";

const HotelSchema = mongoose.Schema({
    encargado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registro'
    },
    nombreHotel: {
        type: String,
    },
    direccion: {
        type: String,
    },
    categoria: {
        type: String,
    },
    rangoPrecios: {
        type: String,
    },
    comodidades: {
        type: String,
    },
    fotosHotel: {
        type: Array,
        default: []
    },
    habitaciones: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habitacion'
    }],
    historialEventos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eventos'
    }],
    serviciosAdicionales: [{
        nombre: {
            type: String
        },
        descripcion: {
            type: String,
        },
        precio: {
            type: Number,
        }
    }],
    usoHotelPorEvento:{
        type: Number,
        default: 0
    },
    estado: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Hotel', HotelSchema);