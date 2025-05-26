const { driver } = require('../database/Neo4jConnection');

// Crear un país
const createPais = async (req, res) => {
  const {id, nombre, continente } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `CREATE (p:Pais {
        id: $id,
        nombre: $nombre,
        continente: $continente
      })`,
      { id, nombre, continente }
    );
    res.status(201).json({ message: 'País creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todos los países
const getAllPaises = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (p:Pais) RETURN p`);

    const paises = result.records.map(record => record.get('p').properties);

    res.json(paises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener país por nombre
const getPaisById = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (p:Pais {id: $id})
       RETURN p`,
      { id }
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'País no encontrado' });
    }
    res.json(result.records[0].get('p').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


// Actualizar país
const updatePais = async (req, res) => {
  const { nombre, continente } = req.body;
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (p:Pais {id: $id})
       SET p.nombre = $nombre,
           p.continente = $continente`,
      { id, nombre, continente } 
    );

    // Comprobar si se actualizó algo
    if (result.summary.counters.updates().propertiesSet === 0) {
      return res.status(404).json({ message: 'País no encontrado o sin cambios' });
    }

    res.json({ message: 'País actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


// Eliminar país y sus relaciones con ciudades
const deletePais = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id); // si tu id es numérico

  try {
    const result = await session.run(
      `MATCH (p:Pais {id: $id})
       DETACH DELETE p`,
      { id }
    );

    // Opcional: confirmar si eliminó algo
    if (result.summary.counters.updates().nodesDeleted === 0) {
      return res.status(404).json({ message: 'País no encontrado' });
    }

    res.json({ message: 'País eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


module.exports = {
  createPais,
  getAllPaises,
  getPaisById,
  updatePais,
  deletePais
};
