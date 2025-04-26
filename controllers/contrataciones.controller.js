const { response } = require('express');
const { Contrataciones, Equipos, Futbolistas } = require('../models');
const { isValidObjectId } = require('../helpers/mongo-verify');

// Obtener todos los Contrataciones
const obtenerContrataciones = async (req, res = response) => {
  const { limite = 25, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, contrataciones] = await Promise.all([
      Contrataciones.countDocuments(query),
      Contrataciones.find(query)
        .populate('IdEquipo', 'nombre_equipo')
        .populate('IdJugador', 'nombre') // Aquí hacemos populate de país
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: contrataciones });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Obtener un solo equipo
const obtenerContratacion = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const contratacion = await Contrataciones.findById(id)
    .populate('IdEquipo', 'nombre_equipo')
    .populate('IdJugador', 'nombre')

    if (!contratacion) {
      return res.status(404).json({ Ok: false, resp: 'Contratacion no encontrada' });
    }

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Crear un nuevo equipo
const crearContratacion = async (req, res = response) => {
  const { IdJugador, IdEquipo, fecha_contratacion, monto_contratacion } = req.body;

  try {
    // Validar que el país enviado sea un ObjectId válido
    if (!isValidObjectId(IdJugador)) {
      return res.status(400).json({ Ok: false, resp: 'ID de jugador inválido' });
    }

    // Verificar que el país exista
    const existeJugador = await Futbolistas.findById(IdJugador);

    if (!existeJugador) {
      return res.status(404).json({ Ok: false, resp: 'El jugador no existe' });
    }

    if (!isValidObjectId(IdEquipo)) {
      return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
    }

    // Verificar que el país exista
    const existeEquipo = await Equipos.findById(IdEquipo);

    if (!existeEquipo) {
      return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
    }

    // Crear el nuevo equipo
    const contratacion = new Contrataciones({ IdJugador, IdEquipo, fecha_contratacion, monto_contratacion });

    // Guardar en BD
    await contratacion.save();

    res.status(201).json({ Ok: true, resp: contratacion });

  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Actualizar un equipo
const actualizarContratacion = async (req, res = response) => {
  const { id } = req.params;
  const { IdJugador, IdEquipo,...data } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }
  if (IdJugador) { // Solo validamos si viene un nuevo país en la actualización
    if (!isValidObjectId(IdJugador)) {
      return res.status(400).json({ Ok: false, resp: 'ID de jugador inválido' });
    }

    const existeJugador = await Futbolistas.findById(IdJugador);
    if (!existeJugador) {
      return res.status(404).json({ Ok: false, resp: 'El jugador no existe' });
    }

    data.IdJugador = IdJugador; // Si todo está bien, actualizamos el campo país
  }

  if (IdEquipo) { // Solo validamos si viene un nuevo país en la actualización
    if (!isValidObjectId(IdEquipo)) {
      return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
    }

    const existeEquipo = await Equipos.findById(IdEquipo);
    if (!existeEquipo) {
      return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
    }

    data.IdEquipo = IdEquipo; // Si todo está bien, actualizamos el campo país
  }

  try {
    const contratacion = await Contrataciones.findByIdAndUpdate(id, data, { new: true })
    .populate('IdEquipo', 'nombre_equipo')
    .populate('IdJugador', 'nombre')

    if (!contratacion) {
      return res.status(404).json({ Ok: false, resp: 'Contratacion no encontrada' });
    }

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Borrar un equipo 
const borrarContratacion = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const contratacion = await Contrataciones.findByIdAndDelete(id);

    if (!contratacion) {
      return res.status(404).json({ Ok: false, resp: 'Contratacion no encontrado' });
    }

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

module.exports = {
  obtenerContrataciones,
  obtenerContratacion,
  crearContratacion,
  actualizarContratacion,
  borrarContratacion
};
