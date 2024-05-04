import mongoose from "mongoose";

const HabitacionSchema = mongoose.Schema({
    tipoHabitacion: {
        type: String,
        required: [true, "El tipo de habitación es obligatorio"]
    },
    capacidadPersonas: {
        type: String,
        required: [true, "La capacidad de personas es obligatoria"]
    },
    fotos: {
        type: Array,
        default: []
    },
    disponibilidad: {
        type: Boolean,
        default: true
    },
    precio: {
        type: Number,
        required: [true, "El precio de la habitación es obligatorio"]
    },
    disponibleApartir: {
        type: Date,
        required: [true, "La fecha de disponibilidad es obligatoria"]
    },
});

export default mongoose.model('Habitacion', HabitacionSchema);