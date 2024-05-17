import mongoose from "mongoose";

const HabitacionSchema = mongoose.Schema({
    tipoHabitacion: {
        type: String,
    },
    capacidadPersonas: {
        type: String,
    },
    fotos: {
        type: Array,
        default: []
    },
    disponibilidad: {
        type: Boolean,
        default: true
    },
    precioPorNoche: {
        type: Number,
    },
    disponibleApartir: {
        type: Date,
    },
});

export default mongoose.model('Habitacion', HabitacionSchema);