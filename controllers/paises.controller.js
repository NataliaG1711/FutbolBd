const { response } = require("express");
const Paises = require("../models/paises");
const { isValidObjectId } = require("../helpers/mongo-verify");

const obtenerPaises = async (req, res = response) => {
  const { limite = 25, desde = 0 } = req.query;
  const query = {};

  try {
    const [total, paises] = await Promise.all([
      Paises.countDocuments(query),
      Paises.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: paises });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

const obtenerPais = async (req, res = response) => {
  const { id } = req.params;

  // Validar primero si el ID es un ObjectId válido
  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  try {
    const pais = await Paises.findById(id);

    if (!pais) {
      return res.status(404).json({ Ok: false, resp: 'País no encontrado' });
    }

    res.json({ Ok: true, resp: pais });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

const crearPais = async (req, res = response) => {
  const { nombre, continente } = req.body;


  try {
    const paisExiste = await Paises.findOne({ nombre: nombre.toUpperCase() });

    if (paisExiste) {
      return res.status(400).json({
        Ok: false,
        resp: `El país ${nombre} ya existe`
      });
    }

    const data = {
      nombre: nombre.toUpperCase(),
      continente: continente.toUpperCase()
    };

    const nuevoPais = new Paises(data);
    await nuevoPais.save();

    res.status(201).json({ Ok: true, resp: nuevoPais });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

const actualizarPais = async (req, res = response) => {
  const { id } = req.params;
  const { nombre, continente } = req.body;

  try {
    const data = {};
    if (nombre) data.nombre = nombre.toUpperCase();
    if (continente) data.continente = continente.toUpperCase();

    const paisActualizado = await Paises.findByIdAndUpdate(id, data, { new: true });

    if (!paisActualizado) {
      return res.status(404).json({ Ok: false, resp: 'País no encontrado' });
    }

    res.json({ Ok: true, resp: paisActualizado });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

const borrarPais = async (req, res = response) => {
  const { id } = req.params;

  try {
    const paisBorrado = await Paises.findByIdAndDelete(id);

    if (!paisBorrado) {
      return res.status(404).json({ Ok: false, resp: 'País no encontrado' });
    }

    res.json({ Ok: true, resp: paisBorrado });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};

module.exports = {
  obtenerPaises,
  obtenerPais,
  crearPais,
  actualizarPais,
  borrarPais
};