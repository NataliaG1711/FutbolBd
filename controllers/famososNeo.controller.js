const { driver } = require('../database/Neo4jConnection');

// Crear un famoso
const createFamoso = async (req, res) => {
  const { id, nombre, profesion, fecha_nacimiento, lugar_nacimiento } = req.body;
  const session = driver.session();
  try {
    // Crea el Famoso
    await session.run(
      `CREATE (f:Famoso {
        id: $id,
        nombre: $nombre,
        profesion: $profesion,
        fecha_nacimiento: $fecha_nacimiento,
        lugar_nacimiento: $lugar_nacimiento
      })`,
      { id, nombre, profesion, fecha_nacimiento, lugar_nacimiento }
    );

    // Establece la relación con la ciudad donde nació
    await session.run(
      `MATCH (f:Famoso {id: $id}), (c:Ciudad {nombre: $lugar_nacimiento})
       CREATE (f)-[:NACIO_EN { fecha_nacimiento: $fecha_nacimiento }]->(c)`,
      { id, lugar_nacimiento, fecha_nacimiento }
    );

    res.status(201).json({ message: 'Famoso creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todos los famosos
const getAllFamosos = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (f:Famoso) RETURN f');
    const famosos = result.records.map(record => record.get('f').properties);
    res.json(famosos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener famoso por ID
const getFamosoById = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (f:Famoso {id: $id}) RETURN f`,
      { id }
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Famoso no encontrado' });
    }
    res.json(result.records[0].get('f').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar famoso
const updateFamoso = async (req, res) => {
  const { nombre, profesion, fecha_nacimiento, lugar_nacimiento } = req.body;
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    await session.run(
      `MATCH (f:Famoso {id: $id})
       SET f.nombre = $nombre,
           f.profesion = $profesion,
           f.fecha_nacimiento = $fecha_nacimiento,
           f.lugar_nacimiento = $lugar_nacimiento`,
      {
        id,
        nombre,
        profesion,
        fecha_nacimiento,
        lugar_nacimiento
      }
    );
    res.json({ message: 'Famoso actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar famoso
const deleteFamoso = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    // Eliminar relación NACIO_EN
    await session.run(
      `MATCH (f:Famoso {id: $id})-[r:NACIO_EN]->(c:Ciudad)
       DELETE r`,
      { id }
    );

    // Eliminar nodo del famoso
    await session.run(
      `MATCH (f:Famoso {id: $id}) DELETE f`,
      { id }
    );

    res.json({ message: 'Famoso eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createFamoso,
  getAllFamosos,
  getFamosoById,
  updateFamoso,
  deleteFamoso
};
