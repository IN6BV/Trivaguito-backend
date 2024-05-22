import ListaEspera from "./listaEspera.model.js";
import Registro from "../registro/registro.model.js";

export const postListaEspera = async (req, res) => {
    const user = req.user.uid;

    try {
        const usuario = await Registro.findById(user);

        if (usuario.role !== "USER") {
            return res.status(404).json({ msg: "No puedes añadirte a esta lista" });
        } else {

        const listaEspera = new ListaEspera({ idUsuario: user });
        await listaEspera.save();

        res.status(201).json({ msg: "Usuario agregado a la lista de espera", listaEspera });
        
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al guardar en la lista de espera" });
    }
}

export const getListaEspera = async (req, res) => {
    const listaEspera = await ListaEspera.find();

const listaUsuarios = await Registro.find({_id: { $in: listaEspera.map(item => item.idUsuario) }}, 'nombre apellido email');

const listaEsperaConInfoUsuario = listaEspera.map(item => {
    const usuario = listaUsuarios.find(user => user._id.equals(item.idUsuario));
    return {
        ...item.toObject(),
        usuario: usuario ? {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email
        } : null
    };
});

console.log(listaEsperaConInfoUsuario);

res.json(listaEsperaConInfoUsuario);
};

export const deleteListaEspera = async (req, res) => {
    const { id } = req.params;
    const user = req.user.uid;

    const usuario = await Registro.findById(user);

    if (usuario.role === "PLATFORM_MANAGER") {
        const listaEspera = await ListaEspera.findByIdAndDelete(id);
        res.status(200).json({
            msg: "Usuario eliminado de la lista de espera",
            listaEspera
        });
    } else {
        res.status(401).json({
            msg: "No autorizado"
        });
    }
}