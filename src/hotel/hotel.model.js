import mongoose from "mongoose";

const HotelSchema = mongoose.Schema({
    nombreHotel: {
        type: String,
        required: [true, "El nombre del hotel es obligatorio"]
    },
    direccion: {
        type: String,
        required: [true, "La dirección del hotel es obligatoria"]
    },
    categoria: {
        type: String,
        required: [true, "La categoría es obligatoria"]
    },
    rangoPrecios: {
        type: String,
        required: [true, "El rango de precios es obligatorio"]
    },
    comodidades: {
        type: String,
        required: [true, "Las comodidades son obligatorias"]
    },
    fotosHotel: {
        type: Array,
        default: []
    },
    habitaciones: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habitacion'
    },
    historialOcupacion: {
        type: number,
        default: 0
    },
    historialEventos:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eventos'
    },
    demandaHotel: {
        type: number,
        default: 0
    },
    serviciosAdicionales: {
        nombre: {
            type: String,
            required: [true, "El nombre del servicio adicional es obligatorio"]
        },
        descripcion: {
            type: String,
            required: [true, "La descripción del servicio adicional es obligatoria"]
        },
        precio: {
            type: number,
            required: [true, "El precio del servicio adicional es obligatorio"]
        }
    },
    estado: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Hotel', HotelSchema);