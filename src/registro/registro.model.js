import mongoose from "mongoose";

const RegistroSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    apellido: {
        type: String,
        required: [true, "El apellido es obligatorio"]
    },
    foto: {
        type: String,
        required: [true, "La foto es obligatoria"]
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    historialReservas: {
        type: Array,
        default: []
    },        
    historialServiciosUtilizados: {
        type: Array,
        default: []
    },
    role: {
        type: String,
        enum: ["USER", "HOTEL_ADMINISTRATION", "PLATFORM_MANAGER"],
        default: "USER"
    },
    estado : {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('registroUsuario', RegistroSchema);