import mongoose from "mongoose";

const listaEsperaSchema = mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registro',
    }
});

export default mongoose.model("ListaEspera", listaEsperaSchema);
