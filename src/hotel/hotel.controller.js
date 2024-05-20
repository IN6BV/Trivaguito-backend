import Hotel from "./hotel.model.js";
import ReservacionHabitacion from '../reservacionHabitacion/reservacionHab.model.js'
import Habitacion from '../habitacion/habitacion.model.js'
import Registro from "../registro/registro.model.js";

export const postHotel = async (req, res) => {
    const {nombreHotel, direccion, categoria, rangoPrecios, comodidades, fotosHotel, usoHotelPorEvento, nombre, descripcion, precio } = req.body;
    const adminHotel = req.user.email;

    const adminHotelT = await Registro.findOne({email: adminHotel});
    
    if(adminHotelT.role !== "HOTEL_ADMINISTRATION"){
        return res.status(400).json({
            msg: "No tienes permisos para registrar un hotel"
        });
    } else {
        const serviciosAdicionales = {nombre, descripcion, precio};
        const newHotel = new Hotel({encargado: adminHotelT.uid, nombreHotel, direccion, categoria, rangoPrecios, comodidades, fotosHotel, usoHotelPorEvento, serviciosAdicionales: serviciosAdicionales });
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
export const getHotelByReservations = async (req, res) => {
    try {
        const hotels = await Hotel.aggregate([
            {
                $lookup: {
                    from: 'habitacions',
                    localField: 'habitaciones',
                    foreignField: '_id',
                    as: 'rooms'
                }
            },
            {
                $unwind: {
                    path: '$rooms',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'reservacionhabitacions',
                    localField: 'idHabitacion',
                    foreignField: 'rooms._id',
                    as: 'reservations'
                }
            },
            {
                $unwind: {
                    path: '$reservations',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    nombreHotel: { $first: '$nombreHotel' },
                    direccion: { $first: '$direccion' },
                    categoria: { $first: '$categoria' },
                    rangoPrecios: { $first: '$rangoPrecios' },
                    comodidades: { $first: '$comodidades' },
                    fotosHotel: { $first: '$fotosHotel' },
                    historialEventos: { $first: '$historialEventos' },
                    serviciosAdicionales: { $first: '$serviciosAdicionales' },
                    usoHotelPorEvento: { $first: '$usoHotelPorEvento' },
                    estado: { $first: '$estado' },
                    totalReservations: {
                        $sum: {
                            $cond: [{ $eq: ['$reservations.estadoReserva', 'RESERVADA'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { totalReservations: -1 }
            }
        ]);

        console.log("Aggregation result:", hotels);

        res.json({ hotels });
    } catch (error) {
        console.error("Error in getHotelByReservations:", error);
        res.status(500).json({ message: 'Error obteniendo los hoteles por reservaciones', error: error.message });
    }
};


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
export const getAllReservationsFromHotel = async (req, res)=>{
    try {
        const {id} = req.params
        const hotel = await Hotel.findById(id).populate('habitaciones')
        if(!hotel){
            return res.status(404).json({message: 'Hotel no encontrado'})
        }
        const rooms = hotel.habitaciones; 

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ message: 'Habitaciones not found' });
        }

        const reservations = await ReservacionHabitacion.find({ idHabitacion: { $in: rooms.map(room => room._id) } })
            .populate('idUsuario')
            .populate('idHabitacion');
        
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: 'Reservaciones no encontradas' });
        }

        const reservationsWithDetails = reservations.map(reservation => ({
            _id: reservation._id,
            idUsuario: reservation.idUsuario,
            idHabitacion: {
                id: reservation.idHabitacion._id,
                tipoHabitacion: reservation.idHabitacion.tipoHabitacion,
                capacidadPersonas: reservation.idHabitacion.capacidadPersonas,
                disponibilidad: reservation.idHabitacion.disponibilidad,
                precioPorNoche: reservation.idHabitacion.precioPorNoche,
                disponibleApartir: reservation.idHabitacion.disponibleApartir,
            },
            fechaInicio: reservation.fechaInicio,
            fechaFin: reservation.fechaFin,
            estadoReserva: reservation.estadoReserva,
            listaServiciosUtilizados: reservation.listaServiciosUtilizados,
            totalReserva: reservation.totalReserva
        }));

        res.status(200).json({
            message: 'Reservaciones encontradas correctamente',
            reservations: reservationsWithDetails
        });
    } catch (e) {
        console.error("No se obtuvieron las reservaciones: ", e)
        res.status(500).json({message: 'No se obtuvieron las reservaciones', error: e.message})
    }
}
export const getAllUsersWithReservationsInHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findById(id).populate('habitaciones');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel no encontrado' });
        }

        const roomIds = hotel.habitaciones.map(room => room._id);

        const reservations = await ReservacionHabitacion.find({
            idHabitacion: { $in: roomIds }
        }).populate('idUsuario', 'nombre email');

        const usersMap = new Map();
        reservations.forEach(reservation => {
            const userId = reservation.idUsuario._id.toString();
            if (!usersMap.has(userId)) {
                usersMap.set(userId, {
                    ...reservation.idUsuario.toObject(),
                    reservations: []
                });
            }
            usersMap.get(userId).reservations.push({
                _id: reservation._id,
                idHabitacion: {
                    id: reservation.idHabitacion._id,
                    tipoHabitacion: reservation.idHabitacion.tipoHabitacion,
                    capacidadPersonas: reservation.idHabitacion.capacidadPersonas,
                    disponibilidad: reservation.idHabitacion.disponibilidad,
                    precioPorNoche: reservation.idHabitacion.precioPorNoche,
                    disponibleApartir: reservation.idHabitacion.disponibleApartir,
                },
                fechaInicio: reservation.fechaInicio,
                fechaFin: reservation.fechaFin,
                estadoReserva: reservation.estadoReserva,
                listaServiciosUtilizados: reservation.listaServiciosUtilizados,
                totalReserva: reservation.totalReserva
            });
        });

        res.status(200).json({
            message: 'Usuarios con reservaciones encontrados correctamente',
            users: uniqueUsers
        });
    } catch (error) {
        console.error("Error encontrando los usuarios con reservacion", error);
        res.status(500).json({ message: 'Error obteniendo usuarios con reservaciones', error: error.message });
    }
};
export const getHabitationBookOrNot = async (req, res) =>{
    try {
        const { id } = req.params
        const hotel = await Hotel.findById(id).populate('habitaciones')
        if(!hotel){
            return res.status(404).json({ message: 'Hotel no encontrado' });
        }
        const habitacionesDisponibles = hotel.habitaciones.map(habitacion => ({
            id: habitacion._id,
            tipoHabitacion: habitacion.tipoHabitacion,
            capacidadPersonas: habitacion.capacidadPersonas,
            disponibilidad: habitacion.disponibilidad,
            precioPorNoche: habitacion.precioPorNoche,
            disponibleApartir: habitacion.disponibleApartir
        }));

        res.status(200).json({
            message: 'Disponibilidad de habitaciones obtenida correctamente',
            habitacionesDisponibles
        });
    } catch (error) {
        console.error("Error obteniendo la disponibilidad de las habitaciones: ", error);
        res.status(500).json({ message: 'Error obteniendo la disponibilidad de las habitaciones', error: error.message });
    }
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
