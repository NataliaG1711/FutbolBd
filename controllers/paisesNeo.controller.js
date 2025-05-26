const { driver } = require('../database/Neo4jConnection');

// Crear un país
const createPais = async (req, res) => {
  const { nombre, continente } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `CREATE (p:Pais {
        nombre: $nombre,
        continente: $continente
      })`,
      { nombre, continente }
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
      `MATCH (p:Pais) OPTIONAL MATCH (p)<-[:PERTENECE_A]-(c:Ciudad)
       RETURN p, collect(c) AS ciudades`
    );

    const paises = result.records.map(record => {
      const pais = record.get('p').properties;
      const ciudades = record.get('ciudades').map(ciudad => ciudad.properties);
      return { ...pais, ciudades };
    });

    res.json(paises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener país por nombre
const getPaisById = async (req, res) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (p:Pais {nombre: $id}) OPTIONAL MATCH (p)<-[:PERTENECE_A]-(c:Ciudad)
       RETURN p, collect(c) AS ciudades`,
      { id }
    );

    if (!result.records.length) {
      return res.status(404).json({ message: 'País no encontrado' });
    }

    const pais = result.records[0].get('p').properties;
    const ciudades = result.records[0].get('ciudades').map(ciudad => ciudad.properties);

    res.json({ ...pais, ciudades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar país
const updatePais = async (req, res) => {
  const { nombre, continente } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `MATCH (p:Pais {nombre: $id})
       SET p.nombre = $nombre,
           p.continente = $continente`,
      { id: req.params.id, nombre, continente }
    );
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

  try {
    await session.run(
      `MATCH (p:Pais {nombre: $id})<-[r:PERTENECE_A]-(c:Ciudad)
       DELETE r`,
      { id: req.params.id }
    );

    await session.run(
      `MATCH (p:Pais {nombre: $id})
       DELETE p`,
      { id: req.params.id }
    );

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
