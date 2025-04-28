const { response } = require('express');
const { Equipos, Paises, Futbolistas } = require('../models');
const { isValidObjectId } = require('../helpers/mongo-verify');

// Obtener todos los equipos
const obtenerFutbolistas = async (req, res = response) => {



  const { limite = 25, desde = 0 } = req.query;
  const query = {}; // Puedes agregar filtros si quieres

  try {
    const [total, futbolistas] = await Promise.all([
      Futbolistas.countDocuments(query),
      Futbolistas.find(query)
        .populate('pais_nacimiento', 'nombre continente') // Muestra nombre y continente del país
        .populate('equipo_actual', 'nombre_equipo')           // Muestra solo el nombre del equipo actual
        .populate('equipos_anteriores', 'nombre_equipo')  // Muestra nombre de equipos anteriores
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({ Ok: true, total, resp: futbolistas });
  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};


// Obtener un solo equipo
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

// Crear un nuevo equipo
const crearFutbolista = async (req, res = response) => {

  const { nombre, apellidos, edad, internacional, fecha_nacimiento, pais_nacimiento, equipo_actual, equipos_anteriores = [] } = req.body;

  const existeFutbolista = Futbolistas.findOne({nombre});

  if (existeFutbolista){
    return res.status(400).json({
      ok: false,
      msg: 'Ya existe el futbolista'
    })
  }

  try {
    // Validar que país_id sea un ObjectId válido
    if (!isValidObjectId(pais_nacimiento)) {
      return res.status(400).json({ Ok: false, resp: 'ID de país inválido' });
    }

    // Validar que equipo_actual sea un ObjectId válido
    if (!isValidObjectId(equipo_actual)) {
      return res.status(400).json({ Ok: false, resp: 'ID de equipo inválido' });
    }

    // Validar que todos los IDs de equipos_anteriores sean válidos
    const idsInvalidos = equipos_anteriores.filter(id => !isValidObjectId(id));
    if (idsInvalidos.length > 0) {
      return res.status(400).json({ Ok: false, resp: 'Hay IDs inválidos en equipos anteriores' });
    }

    // Verificar existencia de país
    const existePais = await Paises.findById(pais_nacimiento);
    if (!existePais) {
      return res.status(404).json({ Ok: false, resp: 'El país no existe' });
    }

    // Verificar existencia del equipo actual
    const existeEquipo = await Equipos.findById(equipo_actual);
    if (!existeEquipo) {
      return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
    }

    // Crear el nuevo futbolista
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

    // Guardar en la BD
    await futbolista.save();

    res.status(201).json({ Ok: true, resp: futbolista });

  } catch (error) {
    res.status(500).json({ Ok: false, resp: error.message });
  }
};


// Actualizar un equipo
const actualizarFutbolista = async (req, res = response) => {
  const { id } = req.params;
  const { pais_nacimiento, equipo_actual, equipos_anteriores, ...data } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ Ok: false, resp: 'El ID proporcionado no es válido' });
  }

  // Validar y asignar nuevos valores si vienen en la actualización
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
      return res.status(404).json({ Ok: false, resp: 'El equipo no existe' });
    }
    data.equipo_actual = equipo_actual;
  }

  if (equipos_anteriores) {
    const idsInvalidos = equipos_anteriores.filter(id => !isValidObjectId(id));
    if (idsInvalidos.length > 0) {
      return res.status(400).json({ Ok: false, resp: 'Hay IDs inválidos en equipos anteriores' });
    }
    data.equipos_anteriores = equipos_anteriores;
  }

  try {
    const futbolista = await Futbolistas.findByIdAndUpdate(id, data, { new: true })
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


// Borrar un equipo 
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
