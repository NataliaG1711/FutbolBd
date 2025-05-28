const { driver } = require('../database/Neo4jConnection');


const createCiudad = async (req, res) => {
  const { id, nombre, poblacion, pais } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `CREATE (c:Ciudad {
        id: $id,
        nombre: $nombre,
        poblacion: $poblacion,
        pais: $pais
      })`,
      { id,nombre, poblacion, pais }
    );
    await session.run(
      `MATCH (c:Ciudad {id: $id}), (p:Pais {nombre: $pais})
       CREATE (c)-[:PERTENECE_A]->(p)`,
      { id,pais}
    );

    res.status(201).json({ message: 'Ciudad creada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todas las ciudades
const getAllCiudades = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (c:Ciudad) RETURN c');
    const ciudades = result.records.map(record => record.get('c').properties);
    res.json(ciudades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener ciudad por nombre
const getCiudadById = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Ciudad {id: $id}) RETURN c`,
      {id}
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Ciudad no encontrada' });
    }
    res.json(result.records[0].get('c').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

//actualizar ciudad
const updateCiudad = async (req, res) => {
  const { nombre,poblacion} = req.body;
  const id = parseInt(req.params.id);
  const session = driver.session();
  try {
    await session.run(
      `MATCH (c:Ciudad {id: $id})
       SET c.nombre = $nombre,
           c.poblacion = $poblacion`,
      {
        id,
        nombre,
        poblacion
      }
    );
    res.json({ message: 'Ciudad actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar ciudad
const deleteCiudad = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();
  try {
    await session.run(
      `MATCH (c:Ciudad {id: $id})-[r:PERTENECE_A]->(p:Pais)
      DELETE r`,
      { id}
    );

    //DETACH
    /*
    await session.run(
      `MATCH (p:Persona {id: $id}) DETACH DELETE p`,
      { id: req.params.id }
    );
    */


    await session.run(
      `MATCH (c:Ciudad {id: $id}) DELETE c`,
      { id: req.params.id }
    );
    res.json({ message: 'Ciudad eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createCiudad,
  getAllCiudades,
  getCiudadById,
  updateCiudad,
  deleteCiudad
};
