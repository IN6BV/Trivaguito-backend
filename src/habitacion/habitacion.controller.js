import Registro from '../registro/registro.model.js';
import Hotel from '../hotel/hotel.model.js';
import Habitacion from './habitacion.model.js';

export const postHabitacion = async (req, res) => {
  const adminHotel = req.user.email;

  const admin = await Registro.findOne({ email: adminHotel });

  const hotel = await Hotel.findOne({ encargado: admin.uid });

  if (hotel) {
    const {
      tipoHabitacion,
      capacidadPersonas,
      precio,
      fotos,
      precioPorNoche,
      disponibleApartir,
    } = req.body;
    const newHabitacion = new Habitacion({
      tipoHabitacion,
      capacidadPersonas,
      precio,
      fotos,
      precioPorNoche,
      disponibleApartir,
    });
    await newHabitacion.save();

    if (!hotel.habitaciones) {
      hotel.habitaciones = [];
    }

    hotel.habitaciones.push(newHabitacion._id);
    await hotel.save();

    console.log(hotel);

    res.status(201).json({
      msg: 'Habitación registrada con éxito',
      newHabitacion,
    });
  } else {
    console.log(hotel);
    res.status(400).json({
      msg: 'No se encontró el hotel',
    });
  }
};

export const getHabitaciones = async (req, res) => {
  const habitaciones = await Habitacion.find();
  res.json({
    habitaciones,
  });
};

export const getHabitacion = async (req, res) => {
  const { id } = req.params;
  const habitacion = await Habitacion.findById(id);
  res.json({
    habitacion,
  });
};
export const getHabitationsFromHotel = async (req, res) => {
    try {
      const adminHotel = req.user.email;
  
      const admin = await Registro.findOne({ email: adminHotel });
      if (!admin) {
        return res.status(404).json({ msg: "Admin not found" });
      }
  
      const hotel = await Hotel.findOne({ encargado: admin.uid });

      if (!hotel) {
        return res.status(404).json({ message: 'Hotel no encontrado' });
      }
  
      const habitationIds = hotel.habitaciones;
      const habitations = await Habitacion.find({ _id: { $in: habitationIds } });
  
      res.status(200).json({
        msg: "Habitaciones retrieved successfully",
        habitaciones: habitations,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: 'Internal Server Error', error: e.message });
    }
  };

export const putHabitacion = async (req, res) => {
  const { id } = req.params;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });
  const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

  if (hotel) {
    const { _id, ...rest } = req.body;
    const habitacion = await Habitacion.findByIdAndUpdate(id, rest);

    const habitacionActualizada = await Habitacion.findById(id);
    res.json({
      msg: 'Habitación modificada con éxito',
      habitacion,
      habitacionActualizada
    });
  }
};

export const deleteHabitacion = async (req, res) => {
  const { id } = req.params;
  const adminHotel = req.user.email;

  const adminHotelT = await Registro.findOne({ email: adminHotel });
  const hotel = await Hotel.findOne({ encargado: adminHotelT.uid });

  if (hotel) {
    await Habitacion.findByIdAndDelete(id);

    hotel.habitaciones = hotel.habitaciones.filter(
      (habitacion) => habitacion.toString() !== id
    );

    await hotel.save();

    res.json({
      msg: 'Habitación eliminada con éxito',
    });
  } else {
    res.status(400).json({
      msg: 'No se encontró el hotel',
    });
  }
};
