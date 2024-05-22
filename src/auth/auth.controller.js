import Registro from "../registro/registro.model.js";
import bcryptjs from "bcryptjs";
import { generarJWT } from "../helpers/generate-jwt.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //verificar si el email existe:
        const user = await Registro.findOne({ email: email.toLowerCase() });

        if (user && (await bcryptjs.compare(password, user.password))) {
            const token = await generarJWT(user.id, user.email)

            res.status(200).json({
                msg: "Login Ok!!!",
                userDetails: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    foto: user.foto,
                    email: user.email,
                    token: token,
                    role: user.role
                },
            });
        }

        if (!user) {
            return res
                .status(400)
                .send(`Wrong credentials, ${email} doesn't exists en database`);
        }

        // verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).send("wrong password");
        }

    } catch (e) {
        res.status(500).send("Comuniquese con el administrador");
    }
};
