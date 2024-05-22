import Hotel from './hotel.model.js';
import ReservacionHabitacion from '../reservacionHabitacion/reservacionHab.model.js';
import Habitacion from '../habitacion/habitacion.model.js';
import Registro from '../registro/registro.model.js';

export const postHotel = async (req, res) => {
  const {
    nombreHotel,
    direccion,
    categoria,
    rangoPrecios,
    comodidades,
    fotosHotel,
    usoHotelPorEvento,
    nombre,
    descripcion,
    precio,
  } = req.body;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });

  if (adminHotelT.role !== 'HOTEL_ADMINISTRATION') {
    return res.status(400).json({
      msg: 'No tienes permisos para registrar un hotel',
    });
  } else {
    const serviciosAdicionales = { nombre, descripcion, precio };
    const newHotel = new Hotel({
      encargado: adminHotelT.uid,
      nombreHotel,
      direccion,
      categoria,
      rangoPrecios,
      comodidades,
      fotosHotel,
      usoHotelPorEvento,
      serviciosAdicionales: serviciosAdicionales,
    });
    await newHotel.save();
    res.status(201).json({
      msg: 'Hotel registrado con éxito',
      newHotel,
    });
  }
};
export const getAllReservationsFromHotel = async (req, res) => {
  try {
    const adminHotel = req.user.email;
    const adminHotelT = await Registro.findOne({ email: adminHotel });
    if (adminHotelT.role !== 'HOTEL_ADMINISTRATION') {
        return res.status(400).json({
          msg: 'No tienes permisos para registrar un hotel',
        });
    }
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel no encontrado' });
    }

    const habitaciones = hotel.habitaciones;

    if (!habitaciones || habitaciones.length === 0) {
      return res
        .status(404)
        .json({ message: 'Habitaciones no encontradas en este hotel' });
    }

    const reservationIds = habitaciones.map((habitacion) => habitacion._id);
    const reservations = await ReservacionHabitacion.find({
      idHabitacion: { $in: reservationIds },
    });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'Reservaciones no encontradas' });
    }

    const habitacionesMap = new Map();
    for (let id of reservationIds) {
      const habitacion = await Habitacion.findById(id);
      if (habitacion) {
        habitacionesMap.set(id.toString(), habitacion);
      }
    }

    const reservationsWithDetails = reservations.map((reservation) => {
      const habitacion = habitacionesMap.get(
        reservation.idHabitacion.toString()
      );
      return {
        _id: reservation._id,
        idUsuario: reservation.idUsuario,
        idHabitacion: habitacion
          ? {
              _id: habitacion._id,
              tipoHabitacion: habitacion.tipoHabitacion,
              capacidadPersonas: habitacion.capacidadPersonas,
              disponibilidad: habitacion.disponibilidad,
              precioPorNoche: habitacion.precioPorNoche,
              disponibleApartir: habitacion.disponibleApartir,
            }
          : null,
        fechaInicio: reservation.fechaInicio,
        fechaFin: reservation.fechaFin,
        estadoReserva: reservation.estadoReserva,
        listaServiciosUtilizados: reservation.listaServiciosUtilizados,
        totalReserva: reservation.totalReserva,
      };
    });

    res.status(200).json({
      message: 'Reservaciones encontradas correctamente',
      reservations: reservationsWithDetails,
    });
  } catch (e) {
    console.error('No se obtuvieron las reservaciones: ', e);
    res.status(500).json({
      message: 'No se obtuvieron las reservaciones',
      error: e.message,
    });
  }
};

export const getHotels = async (req, res) => {
  const hotels = await Hotel.find();
  res.json({
    hotels,
  });
};

export const getHotel = async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findById(id);
  res.json({
    hotel,
  });
};
export const getHotelByReservations = async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $lookup: {
          from: 'habitacions',
          localField: 'habitaciones',
          foreignField: '_id',
          as: 'rooms',
        },
      },
      {
        $unwind: {
          path: '$rooms',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'reservacionhabitacions',
          localField: 'idHabitacion',
          foreignField: 'rooms._id',
          as: 'reservations',
        },
      },
      {
        $unwind: {
          path: '$reservations',
          preserveNullAndEmptyArrays: true,
        },
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
              $cond: [
                { $eq: ['$reservations.estadoReserva', 'RESERVADA'] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { totalReservations: -1 },
      },
    ]);

    console.log('Aggregation result:', hotels);

    res.json({ hotels });
  } catch (error) {
    console.error('Error in getHotelByReservations:', error);
    res.status(500).json({
      message: 'Error obteniendo los hoteles por reservaciones',
      error: error.message,
    });
  }
};

export const putHotel = async (req, res) => {
  const { id } = req.params;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });
  const hotelito = await Hotel.findOne({ encargado: adminHotelT.uid });

  console.log(
    adminHotelT.role === 'HOTEL_ADMINISTRATION' &&
      hotelito.encargado === adminHotelT.uid
  );

  if (
    adminHotelT.role === 'HOTEL_ADMINISTRATION' &&
    hotelito.encargado === adminHotelT.uid
  ) {
    const { _id, encargado, habitaciones, historialEventos, ...rest } =
      req.body;
    const hotel = await Hotel.findByIdAndUpdate(id, rest);

    const hotelActualizado = await Hotel.findById(id);
    res.json({
      msg: 'Hotel modificado con éxito',
      hotelActualizado,
    });
  } else {
    return res.status(400).json({
      msg: 'No tienes permisos para modificar un hotel',
    });
  }
};

export const getAllUsersWithReservationsInHotel = async (req, res) => {
  try {
    const adminHotel = req.user.email;
    const adminHotelT = await Registro.findOne({ email: adminHotel });
    if (adminHotelT.role !== 'HOTEL_ADMINISTRATION') {
        return res.status(400).json({
          msg: 'No tienes permisos para registrar un hotel',
        });
    }
    const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel no encontrado' });
    }

    const habitaciones = hotel.habitaciones;

    if (!habitaciones || habitaciones.length === 0) {
      return res
        .status(404)
        .json({ message: 'Habitaciones no encontradas en este hotel' });
    }

    const reservationIds = habitaciones.map((habitacion) => habitacion._id);
    const reservations = await ReservacionHabitacion.find({
      idHabitacion: { $in: reservationIds },
    });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'Reservaciones no encontradas' });
    }

    const userIds = reservations.map((reservation) => reservation.idUsuario);
    const uniqueUserIds = [...new Set(userIds)];
    const usersMap = new Map();
    for (let id of uniqueUserIds) {
      const user = await Registro.findById(id);
      if (user) {
        usersMap.set(id.toString(), user);
      }
    }
    const reservationsWithDetails = reservations.map((reservation) => {
        const user = usersMap.get(reservation.idUsuario.toString());
        return {
          _id: reservation._id,
          idUsuario: user
            ? {
                _id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                foto: user.foto
              }
            : null,
          idHabitacion: reservation.idHabitacion,
          fechaInicio: reservation.fechaInicio,
          fechaFin: reservation.fechaFin,
          estadoReserva: reservation.estadoReserva,
          listaServiciosUtilizados: reservation.listaServiciosUtilizados,
          totalReserva: reservation.totalReserva,
        };
      });
  
      res.status(200).json({
        message: 'Reservaciones encontradas correctamente',
        reservations: reservationsWithDetails,
      });
  } catch (e) {
    console.error('No se obtuvieron las reservaciones: ', e);
    res.status(500).json({
      message: 'No se obtuvieron las reservaciones',
      error: e.message,
    });
  }
};
export const putAddServiciosAdicionales = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });
  const hotelito = await Hotel.findOne({ encargado: adminHotelT.uid });

  if (
    adminHotelT.role === 'HOTEL_ADMINISTRATION' &&
    hotelito.encargado === adminHotelT.uid
  ) {
    const hotel = await Hotel.findByIdAndUpdate(id, {
      $push: { serviciosAdicionales: { nombre, descripcion, precio } },
    });
    const hotelActualizado = await Hotel.findById(id);
    res.json({
      msg: 'Servicio adicional agregado con éxito',
      hotelActualizado,
    });
  } else {
    return res.status(400).json({
      msg: 'No tienes permisos para agregar un servicio adicional',
    });
  }
};
export const deleteHotel = async (req, res) => {
  const { id } = req.params;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });
  const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

  console.log(hotel._id, 'oa');

  if (
    adminHotelT.role === 'HOTEL_ADMINISTRATION' &&
    hotel.encargado === adminHotelT.uid
  ) {
    const hotel = await Hotel.findByIdAndDelete(id);
    res.json({
      msg: 'Hotel eliminado con éxito',
      hotel,
    });
  } else {
    return res.status(400).json({
      msg: 'No tienes permisos para eliminar un hotel',
    });
  }
};
