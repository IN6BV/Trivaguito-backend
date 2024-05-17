import Hotel from "./hotel.model.js";
import Registro from "../registro/registro.model.js";

export const postHotel = async (req, res) => {
    const {nombreHotel, direccion, categoria, rangoPrecios, comodidades, fotosHotel, nombre, descripcion, precio } = req.body;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({email: adminHotel});
    
    if(adminHotelT.role !== "HOTEL_ADMINISTRATION"){
        return res.status(400).json({
            msg: "No tienes permisos para registrar un hotel"
        });
    } else {
        const serviciosAdicionales = {nombre, descripcion, precio};
        const newHotel = new Hotel({encargado: adminHotelT.uid, nombreHotel, direccion, categoria, rangoPrecios, comodidades, fotosHotel, serviciosAdicionales: serviciosAdicionales });
        await newHotel.save();
        res.status(201).json({
            msg: "Hotel registrado con éxito",
            newHotel
        });
    }
}   

export const getHotels = async (req, res) => {
    const hotels = await Hotel.find();
    res.json({
        hotels
    });
}

export const getHotel = async (req, res) => {
    const {id} = req.params;
    const hotel = await Hotel.findById(id);
    res.json({
        hotel
    });
}

export const putHotel = async (req, res) => {
    const {id} = req.params;
    const adminHotel = req.user.email;
    
    const adminHotelT = await Registro.findOne({email: adminHotel});
    const hotelito = await Hotel.findOne({encargado: adminHotelT.uid});
    
    console.log(adminHotelT.role === "HOTEL_ADMINISTRATION" && hotelito.encargado === adminHotelT.uid)

    if(adminHotelT.role === "HOTEL_ADMINISTRATION" && hotelito.encargado === adminHotelT.uid){
        const {_id, encargado, habitaciones, historialEventos, ...rest} = req.body;
        const hotel = await Hotel.findByIdAndUpdate(id, rest)

        const hotelActualizado = await Hotel.findById(id);
        res.json({
            msg: "Hotel modificado con éxito",
            hotelActualizado
        });
    } else {
        return res.status(400).json({
            msg: "No tienes permisos para modificar un hotel"
        });
    };
}

export const putAddServiciosAdicionales = async (req, res) => {
    const {id} = req.params;
    const {nombre, descripcion, precio} = req.body;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({email: adminHotel});
    const hotelito = await Hotel.findOne({encargado: adminHotelT.uid});

    if(adminHotelT.role === "HOTEL_ADMINISTRATION" && hotelito.encargado === adminHotelT.uid){
        const hotel = await Hotel.findByIdAndUpdate(id, {$push: {serviciosAdicionales: {nombre, descripcion, precio}}});
        const hotelActualizado = await Hotel.findById(id);
        res.json({
            msg: "Servicio adicional agregado con éxito",
            hotelActualizado
        });
    } else {
        return res.status(400).json({
            msg: "No tienes permisos para agregar un servicio adicional"
        });
    }
}

export const deleteHotel = async (req, res) => {
    const {id} = req.params;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({email: adminHotel});
    const hotel = await Hotel.findOne({encargado: adminHotelT.uid});

    console.log( hotel._id, "oa")

    if(adminHotelT.role === "HOTEL_ADMINISTRATION" && hotel.encargado === adminHotelT.uid){
        const hotel = await Hotel.findByIdAndDelete(id);
        res.json({
            msg: "Hotel eliminado con éxito",
            hotel
        });
    } else {
        return res.status(400).json({
            msg: "No tienes permisos para eliminar un hotel"
        });
    }
    
}
