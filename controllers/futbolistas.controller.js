const { response } = require('express');
const { Equipos, Paises, Futbolistas } = require('../models');
const { isValidObjectId } = require('../helpers/mongo-verify');

// Obtener todos los futbolistas
const obtenerFutbolistas = async (req, res = response) => {
  const { limite = 25, desde = 0 } = req.query;
  const query = {}; // Puedes agregar filtros en el futuro si quieres

  try {
    const [total, futbolistas] = await Promise.all([
      Futbolistas.countDocuments(query),
      Futbolistas.find(query)
        .populate('pais_nacimiento', 'nombre continente')
        .populate('equipo_actual', 'nombre_equipo')
        .populate('equipos_anteriores', 'nombre_equipo')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: futbolistas });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Obtener un solo futbolista
const obtenerFutbolista = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const futbolista = await Futbolistas.findById(id)
      .populate('pais_nacimiento', 'nombre continente')
      .populate('equipo_actual', 'nombre_equipo')
      .populate('equipos_anteriores', 'nombre_equipo');

    if (!futbolista) {
      return res.status(404).json({ Ok: false, resp: 'Futbolista no encontrado' });
    }

    res.json({ Ok: true, resp: futbolista });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Crear un nuevo futbolista
const crearFutbolista = async (req, res = response) => {
  const {
    nombre, apellidos, edad, internacional, fecha_nacimiento,
    pais_nacimiento, equipo_actual, equipos_anteriores = []
  } = req.body;

  try {

    if (!nombre || !apellidos) {
      return res.status(400).json({ Ok: false, resp: 'Nombre y apellidos son obligatorios' });
    }

    const existeFutbolista = await Futbolistas.findOne({ nombre, apellidos });
    if (existeFutbolista) {
      return res.status(409).json({ Ok: false, resp: 'Ya existe un futbolista con ese nombre y apellidos' });
    }

    if (!isValidObjectId(pais_nacimiento)) {
      return res.status(400).json({ Ok: false, resp: 'ID de país inválido' });
    }

    if (!isValidObjectId(equipo_actual)) {
      return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
    }

    const idsInvalidos = equipos_anteriores.filter(id => !isValidObjectId(id));
    if (idsInvalidos.length > 0) {
      return res.status(400).json({ Ok: false, resp: 'Hay IDs inválidos en equipos anteriores' });
    }

    const existePais = await Paises.findById(pais_nacimiento);
    if (!existePais) {
      return res.status(404).json({ Ok: false, resp: 'El país no existe' });
    }

    const existeEquipoActual = await Equipos.findById(equipo_actual);
    if (!existeEquipoActual) {
      return res.status(404).json({ Ok: false, resp: 'El equipo actual no existe' });
    }

    const equiposExistentes = await Equipos.find({ _id: { $in: equipos_anteriores } });
    if (equiposExistentes.length !== equipos_anteriores.length) {
      return res.status(404).json({ Ok: false, resp: 'Uno o más equipos anteriores no existen' });
    }

    const futbolista = new Futbolistas({
      nombre,
      apellidos,
      edad,
      internacional,
      fecha_nacimiento,
      pais_nacimiento,
      equipo_actual,
      equipos_anteriores
    });

    await futbolista.save();

    res.status(201).json({ Ok: true, resp: futbolista });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Actualizar un futbolista
const actualizarFutbolista = async (req, res = response) => {
  const { id } = req.params;
  const { pais_nacimiento, equipo_actual, equipos_anteriores, ...data } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const futbolista = await Futbolistas.findById(id);
    if (!futbolista) {
      return res.status(404).json({ Ok: false, resp: 'Futbolista no encontrado' });
    }

    // Validar y actualizar si vienen datos relacionados
    if (pais_nacimiento) {
      if (!isValidObjectId(pais_nacimiento)) {
        return res.status(400).json({ Ok: false, resp: 'ID de país inválido' });
      }
      const existePais = await Paises.findById(pais_nacimiento);
      if (!existePais) {
        return res.status(404).json({ Ok: false, resp: 'El país no existe' });
      }
      data.pais_nacimiento = pais_nacimiento;
    }

    if (equipo_actual) {
      if (!isValidObjectId(equipo_actual)) {
        return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
      }
      const existeEquipo = await Equipos.findById(equipo_actual);
      if (!existeEquipo) {
        return res.status(404).json({ Ok: false, resp: 'El equipo actual no existe' });
      }
      data.equipo_actual = equipo_actual;
    }

    if (equipos_anteriores) {
      const idsInvalidos = equipos_anteriores.filter(id => !isValidObjectId(id));
      if (idsInvalidos.length > 0) {
        return res.status(400).json({ Ok: false, resp: 'Hay IDs inválidos en equipos anteriores' });
      }
      const equiposExistentes = await Equipos.find({ _id: { $in: equipos_anteriores } });
      if (equiposExistentes.length !== equipos_anteriores.length) {
        return res.status(404).json({ Ok: false, resp: 'Uno o más equipos anteriores no existen' });
      }
      data.equipos_anteriores = equipos_anteriores;
    }

    const futbolistaActualizado = await Futbolistas.findByIdAndUpdate(id, data, { new: true })
      .populate('pais_nacimiento', 'nombre continente')
      .populate('equipo_actual', 'nombre_equipo')
      .populate('equipos_anteriores', 'nombre_equipo');

    res.json({ Ok: true, resp: futbolistaActualizado });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Borrar un futbolista
const borrarFutbolista = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const futbolista = await Futbolistas.findByIdAndDelete(id);

    if (!futbolista) {
      return res.status(404).json({ Ok: false, resp: 'Futbolista no encontrado' });
    }

    res.json({ Ok: true, resp: futbolista });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

module.exports = {
  obtenerFutbolistas,
  obtenerFutbolista,
  crearFutbolista,
  actualizarFutbolista,
  borrarFutbolista
};