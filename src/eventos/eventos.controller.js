import Evento from "./eventos.model.js";
import Registro from "../registro/registro.model.js";
import Hotel from "../hotel/hotel.model.js";

export const postEvento = async (req, res) => {
    const { nombreEvento, fechaHoraEvento, listaServiciosUtilizados, cantidad } = req.body;
    const usuario = req.user.email;

    const user = await Registro.findOne({ email: usuario });

    const serviciosUtilizadosIds = listaServiciosUtilizados.split(',');

    const hotel = await Hotel.findOne({
        'serviciosAdicionales._id': { $in: serviciosUtilizadosIds }
    });


    if (!hotel) {
        return res.status(404).json({
            msg: "El hotel no tiene los servicios adicionales especificados"
        });
    }

    console.log(cantidad, "5")
    let totalEvento = 0;

    console.log(hotel.usoHotelPorEvento);
    let usoHotel = hotel.usoHotelPorEvento;
    console.log(usoHotel);
    
    const serviciosUtilizados = serviciosUtilizadosIds.map(servicioId => {
        const servicio = hotel.serviciosAdicionales.find(s => s._id.toString() === servicioId);
        if (servicio) {
            const precio = isNaN(servicio.precio) ? 0 : servicio.precio;
            const totalServicio = (precio * cantidad) + usoHotel;
            totalEvento += totalServicio;
            return {
                servicios: servicioId,
                cantidad: cantidad
            };
        }
        return null; 
    }).filter(servicio => servicio !== null);

    const newEvento = new Evento({idOrganizador: user.uid, nombreEvento, fechaHoraEvento, listaServiciosUtilizados: serviciosUtilizados, totalEvento });
    
    await newEvento.save();
    hotel.historialEventos.push(newEvento._id);
    await hotel.save();

    res.status(201).json({
        msg: "Evento registrado con éxito, si posee alguna cambio comuníquese con el hotel",
        newEvento
    });
}

export const getEventos = async (req, res) => {
    const eventos = await Evento.find();
    res.json({
        eventos
    });
}

export const getEvento = async (req, res) => {
    const { id } = req.params;
    const evento = await Evento.findById(id);
    res.json({
        evento
    });
}

export const eliminarEvento = async (req, res) => {
    const { id } = req.params;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({ email: adminHotel });
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (hotel) {
        await Evento.findByIdAndDelete(id);

        hotel.historialEventos = hotel.historialEventos.filter(evento => evento.toString() !== id);

        await hotel.save();

        res.json({
            msg: "Evento eliminado con éxito"
        });
    }
}