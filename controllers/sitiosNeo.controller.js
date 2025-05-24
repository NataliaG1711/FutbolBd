const { driver } = require('../database/Neo4jConnection');

// Crear sitio
const createSitio = async (req, res) => {
  const { id, nombre, tipo, descripcion, ubicacion } = req.body;
  const session = driver.session();
  try {
    // Crear el nodo Sitio
    await session.run(
      `CREATE (s:Sitio {
        id: $id,
        nombre: $nombre,
        tipo: $tipo,
        descripcion: $descripcion,
        ubicacion: $ubicacion
      })`,
      { id, nombre, tipo, descripcion, ubicacion }
    );

    // Crear relación con Ciudad
    await session.run(
      `MATCH (s:Sitio {id: $id}), (c:Ciudad {nombre: $ubicacion})
       CREATE (c)-[:TIENE_SITIO]->(s)`,
      { id, ubicacion }
    );

    res.status(201).json({ message: 'Sitio creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todos los sitios
const getAllSitios = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (s:Sitio) RETURN s');
    const sitios = result.records.map(record => record.get('s').properties);
    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener sitio por ID
const getSitioById = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (s:Sitio {id: $id}) RETURN s',
      { id: req.params.id }
    );

    if (!result.records.length) {
      return res.status(404).json({ message: 'Sitio no encontrado' });
    }

    res.json(result.records[0].get('s').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar sitio
const updateSitio = async (req, res) => {
  const { nombre, tipo, descripcion, ubicacion } = req.body;
  const session = driver.session();
  try {
    // Actualizar propiedades
    await session.run(
      `MATCH (s:Sitio {id: $id})
       SET s.nombre = $nombre,
           s.tipo = $tipo,
           s.descripcion = $descripcion,
           s.ubicacion = $ubicacion`,
      {
        id: req.params.id,
        nombre,
        tipo,
        descripcion,
        ubicacion
      }
    );

    // Eliminar relación anterior y crear nueva
    await session.run(
      `MATCH (c:Ciudad)-[r:TIENE_SITIO]->(s:Sitio {id: $id}) DELETE r`,
      { id: req.params.id }
    );

    await session.run(
      `MATCH (c:Ciudad {nombre: $ubicacion}), (s:Sitio {id: $id})
       CREATE (c)-[:TIENE_SITIO]->(s)`,
      { id: req.params.id, ubicacion }
    );

    res.json({ message: 'Sitio actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar sitio
const deleteSitio = async (req, res) => {
  const session = driver.session();
  try {
    await session.run(
      'MATCH (s:Sitio {id: $id}) DETACH DELETE s',
      { id: req.params.id }
    );
    res.json({ message: 'Sitio eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createSitio,
  getAllSitios,
  getSitioById,
  updateSitio,
  deleteSitio
};
