import Registro from "./registro.model.js";
import bcryptjs from "bcryptjs";

export const postRegistro = async (req, res) => {
    const {nombre, apellido, foto, email, password} = req.body;
    const salt = bcryptjs.genSaltSync();
    const encryptedPassword = bcryptjs.hashSync(password, salt);

    const nuevoRegistro = new Registro({
        nombre, apellido, foto,
        email: email.toLowerCase(),
        password: encryptedPassword});

    await nuevoRegistro.save();

    res.json({mensaje: "Registro guardado correctamente",
        nuevoRegistro
    });
}

export const getRegistros = async (req, res) => {
    const registros = await Registro.find();
    res.status(200).json({
        msg: "Lista de registros",
        registros})
}

export const getRegistro = async (req, res) => {
    const {id} = req.params;
    console.log(id);
    const registro = await Registro.findById(id);
    res.status(200).json({
        msg: "Registro encontrado",
        registro
    });
}

export const putRegistro = async (req, res) => {
    const {id} = req.params;

    const {_id, ...resto} = req.body;

    if (password){
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password, salt);
    }

    const registro = await Registro.findByIdAndUpdate(id, resto);

    res.json({
        msg: "Registro actualizado",
        registro
    });
}