const { response } = require('express');
const { Contrataciones, Equipos, Futbolistas } = require('../models');
const { isValidObjectId } = require('../helpers/mongo-verify');

// Obtener todos los Contrataciones
const obtenerContrataciones = async (req, res = response, next) => {
  const { limite = 25, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, contrataciones] = await Promise.all([
      Contrataciones.countDocuments(query),
      Contrataciones.find(query)
        .populate('IdEquipo', 'nombre_equipo')
        .populate('IdJugador', 'nombre')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: contrataciones });
  } catch (error) {
    next(error);
  }
};

// Obtener una sola contratación
const obtenerContratacion = async (req, res = response, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const contratacion = await Contrataciones.findById(id)
      .populate('IdEquipo', 'nombre_equipo')
      .populate('IdJugador', 'nombre');

    if (!contratacion) {
      return res.status(404).json({ Ok: false, resp: 'Contratación no encontrada' });
    }

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva contratación
const crearContratacion = async (req, res = response, next) => {
  const { IdJugador, IdEquipo, fecha_contratacion, monto_contratacion } = req.body;

  try {
    // Validar ID de jugador
    if (!isValidObjectId(IdJugador)) {
      return res.status(400).json({ Ok: false, resp: 'ID de jugador inválido' });
    }
    const existeJugador = await Futbolistas.findById(IdJugador);
    if (!existeJugador) {
      return res.status(404).json({ Ok: false, resp: 'El jugador no existe' });
    }

    // Validar ID de equipo
    if (!isValidObjectId(IdEquipo)) {
      return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
    }
    const existeEquipo = await Equipos.findById(IdEquipo);
    if (!existeEquipo) {
      return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
    }

    // Verificar que no exista una contratación duplicada
    const contratacionExistente = await Contrataciones.findOne({ IdJugador, IdEquipo });
    if (contratacionExistente) {
      return res.status(409).json({ Ok: false, resp: 'Ya existe una contratación entre este jugador y equipo' });
    }

    // Crear la nueva contratación
    const contratacion = new Contrataciones({ IdJugador, IdEquipo, fecha_contratacion, monto_contratacion });
    await contratacion.save();

    res.status(201).json({ Ok: true, resp: contratacion });
  } catch (error) {
    next(error);
  }
};

// Actualizar una contratación
const actualizarContratacion = async (req, res = response, next) => {
  const { id } = req.params;
  const { IdJugador, IdEquipo, ...data } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const contratacionActual = await Contrataciones.findById(id);
    if (!contratacionActual) {
      return res.status(404).json({ Ok: false, resp: 'Contratación no encontrada' });
    }

    if (IdJugador) {
      if (!isValidObjectId(IdJugador)) {
        return res.status(400).json({ Ok: false, resp: 'ID de jugador inválido' });
      }
      const existeJugador = await Futbolistas.findById(IdJugador);
      if (!existeJugador) {
        return res.status(404).json({ Ok: false, resp: 'El jugador no existe' });
      }
      data.IdJugador = IdJugador;
    }

    if (IdEquipo) {
      if (!isValidObjectId(IdEquipo)) {
        return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
      }
      const existeEquipo = await Equipos.findById(IdEquipo);
      if (!existeEquipo) {
        return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
      }
      data.IdEquipo = IdEquipo;
    }

    // Verificar que no dupliquemos si cambiamos jugador o equipo
    if (data.IdJugador || data.IdEquipo) {
      const nuevoJugador = data.IdJugador || contratacionActual.IdJugador;
      const nuevoEquipo = data.IdEquipo || contratacionActual.IdEquipo;

      const duplicado = await Contrataciones.findOne({
        _id: { $ne: id }, // Excluirse a sí mismo
        IdJugador: nuevoJugador,
        IdEquipo: nuevoEquipo
      });

      if (duplicado) {
        return res.status(409).json({ Ok: false, resp: 'Ya existe una contratación entre este jugador y equipo' });
      }
    }

    const contratacion = await Contrataciones.findByIdAndUpdate(id, data, { new: true })
      .populate('IdEquipo', 'nombre_equipo')
      .populate('IdJugador', 'nombre');

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    next(error);
  }
};

// Borrar una contratación
const borrarContratacion = async (req, res = response, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const contratacion = await Contrataciones.findByIdAndDelete(id);

    if (!contratacion) {
      return res.status(404).json({ Ok: false, resp: 'Contratación no encontrada' });
    }

    res.json({ Ok: true, resp: contratacion });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerContrataciones,
  obtenerContratacion,
  crearContratacion,
  actualizarContratacion,
  borrarContratacion
};