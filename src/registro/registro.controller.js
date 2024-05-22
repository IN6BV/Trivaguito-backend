import Registro from "./registro.model.js";
import bcryptjs from "bcryptjs";
import ListaEspera from "../listaEspera/listaEspera.model.js";

export const adminPlatform = async (req, res) => {

    const admin = await Registro.findOne({ email: "admin@gmail.com" });

    if (admin) {
        console.log("Admin ya existe");
    } else {
        const adminDefault = new Registro({
            nombre: "Admin",
            apellido: "Admin",
            foto: "https://cdn-icons-png.flaticon.com/512/2206/2206368.png",
            email: "admin@gmail.com",
            password: bcryptjs.hashSync("123456", 10),
            role: "PLATFORM_MANAGER"
        })

        await adminDefault.save();
    }
}

export const postRegistro = async (req, res) => {
    const { nombre, apellido, foto, email, password, role } = req.body;
    const salt = bcryptjs.genSaltSync();
    const encryptedPassword = bcryptjs.hashSync(password, salt);

    const nuevoRegistro = new Registro({
        nombre, apellido, foto, role,
        email: email.toLowerCase(),
        password: encryptedPassword
    });

    await nuevoRegistro.save();

    res.json({
        mensaje: "Registro guardado correctamente",
        nuevoRegistro
    });
}

export const getRegistros = async (req, res) => {
    const registros = await Registro.find({role: "USER"});
    res.status(200).json({
        msg: "Lista de registros",
        registros
    })
}
export const getRegistroHoteles = async (req, res) =>{
    const registros = await Registro.find({role:"HOTEL_ADMINISTRATION"})
    res.status(200).json({
        msg: "Lista de registros",
        registros
    })
}

export const getRegistro = async (req, res) => {
    console.log("entro en getRegistro");
    const { id } = req.params;
    console.log(id, "ia");
    const registro = await Registro.findById(id);
    res.status(200).json({
        msg: "Registro encontrado",
        registro
    });
}

export const putRegistro = async (req, res) => {
    console.log("entro en putRegistro");
    const { id } = req.params;
    console.log(id, "id putRegistro");

    const { _id, password, historialReservas, historialServiciosUtilizados, role, estado, ...resto } = req.body;

    if (password) {
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password, salt);
    }

    const registro = await Registro.findByIdAndUpdate(id, resto);
    const registroActualizado = await Registro.findById(id);

    res.json({
        msg: "Registro actualizado",
        registroActualizado
    });
}

export const deleteRegistro = async (req, res) => {
    const { id } = req.params;
    const usuario = req.user.email;
    const user = await Registro.findById(id);

    if (usuario === user.email) {
        const registro = await Registro.findByIdAndDelete(id);
        res.status(200).json({
            msg: "Registro eliminado",
            registro
        });
    } else {
        res.status(401).json({
            msg: "No autorizado"
        });
    }
}

export const putUserAAdminHotel = async (req, res) => {
    const admin = req.user.email

    const user = await Registro.findOne({ email: admin });

    if (user.role === "PLATFORM_MANAGER") {
        const { id } = req.params;
        const usuario = await Registro.findById(id);

        const role = "HOTEL_ADMINISTRATION";
        const registro = await Registro.findByIdAndUpdate(id, { role: role });

        const buscar = await ListaEspera.findOne({ idUsuario: usuario._id });

        if (buscar) {
            await ListaEspera.findByIdAndDelete(buscar._id);
        } else {
            console.log("No se encontró el usuario en la lista de espera");
        }

        const registroActualizado = await Registro.findById(id);

        res.json({
            msg: "Role actualizado",
            registroActualizado
        });
    } else {
        res.status(401).json({
            msg: "No autorizado"
        });
    }
}


export const listarUsuariosPorRol = async (req, res) => {
    const { role } = req.params;
    const registros = await Registro.find({ role });
    res.status(200).json({
        msg: "Lista de registros",
        registros
    })
}
