const { response } = require('express');
const { Equipos, Paises } = require('../models');
const { isValidObjectId } = require('../helpers/mongo-verify');

// Obtener todos los equipos
const obtenerEquipos = async (req, res = response) => {
  const { limite = 25, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, equipos] = await Promise.all([
      Equipos.countDocuments(query),
      Equipos.find(query)
        .populate('pais', 'nombre continente') // Aquí hacemos populate de país
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: equipos });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Obtener un solo equipo
const obtenerEquipo = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const equipo = await Equipos.findById(id)
      .populate('pais', 'nombre continente');

    if (!equipo) {
      return res.status(404).json({ Ok: false, resp: 'Equipo no encontrado' });
    }

    res.json({ Ok: true, resp: equipo });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Crear un nuevo equipo
const crearEquipo = async (req, res = response) => {
  const { nombre_equipo, ciudad, pais, estadio } = req.body;

  try {
    // Validar que el país enviado sea un ObjectId válido
    if (!isValidObjectId(pais)) {
      return res.status(400).json({ Ok: false, resp: 'ID de país inválido' });
    }

    // Verificar que el país exista
    const existePais = await Paises.findById(pais);

    if (!existePais) {
      return res.status(404).json({ Ok: false, resp: 'El país no existe' });
    }

    // Crear el nuevo equipo
    const equipo = new Equipos({ nombre_equipo, ciudad, pais, estadio });

    // Guardar en BD
    await equipo.save();

    res.status(201).json({ Ok: true, resp: equipo });

  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Actualizar un equipo
const actualizarEquipo = async (req, res = response) => {
  const { id } = req.params;
  const { pais,...data } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }
  if (pais) { // Solo validamos si viene un nuevo país en la actualización
    if (!isValidObjectId(pais)) {
      return res.status(400).json({ Ok: false, resp: 'ID de país inválido' });
    }

    const existePais = await Paises.findById(pais);
    if (!existePais) {
      return res.status(404).json({ Ok: false, resp: 'El país no existe' });
    }

    data.pais = pais; // Si todo está bien, actualizamos el campo país
  }

  try {
    const equipo = await Equipos.findByIdAndUpdate(id, data, { new: true })
      .populate('pais', 'nombre continente');

    if (!equipo) {
      return res.status(404).json({ Ok: false, resp: 'Equipo no encontrado' });
    }

    res.json({ Ok: true, resp: equipo });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

// Borrar un equipo 
const borrarEquipo = async (req, res = response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const equipo = await Equipos.findByIdAndDelete(id);

    if (!equipo) {
      return res.status(404).json({ Ok: false, resp: 'Equipo no encontrado' });
    }

    res.json({ Ok: true, resp: equipo });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

module.exports = {
  obtenerEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  borrarEquipo
};
