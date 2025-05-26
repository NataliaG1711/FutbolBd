// controllers/personaController.js
const {driver} = require('../database/Neo4jConnection');


const createPersona = async (req, res) => {
  const { id, nombre, tipo, fecha_nacimiento, lugar_nacimiento } = req.body;
  const session = driver.session();
  try {
   
    //Crea la Persona
    await session.run(
      `CREATE (p:Persona {
        id: $id,
        nombre: $nombre,
        tipo: $tipo,
        fecha_nacimiento: $fecha_nacimiento,
        lugar_nacimiento: $lugar_nacimiento
      })`,
      { id, nombre, tipo, fecha_nacimiento, lugar_nacimiento }
    );


    //Estable la relacion con el pais donde nacio
    await session.run(
      `MATCH (p:Persona {id: $id}), (c:Ciudad {nombre: $lugar_nacimiento})
       CREATE (p)-[:NACIO_EN { fecha_nacimiento: $fecha_nacimiento }]->(c)`,
      { id,lugar_nacimiento,fecha_nacimiento}
    );
 
    res.status(201).json({ message: 'Persona creada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const getAllPersonas = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Persona) RETURN p');
    const personas = result.records.map(record => record.get('p').properties);
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const getPersonaById = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (p:Persona {id: $id}) RETURN p`,
      { id}
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json(result.records[0].get('p').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const updatePersona = async (req, res) => {
  const { nombre, tipo, fecha_nacimiento, lugar_nacimiento } = req.body;
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    await session.run(
      `MATCH (p:Persona {id: $id})
       SET p.nombre = $nombre,
           p.tipo = $tipo,
           p.fecha_nacimiento = $fecha_nacimiento,
           p.lugar_nacimiento = $lugar_nacimiento`,
      {
        id,
        nombre,
        tipo,
        fecha_nacimiento,
        lugar_nacimiento
      }
    );
    res.json({ message: 'Persona actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const deletePersona = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {


    await session.run(
      `MATCH (p:Persona {id: $id})-[r:NACIO_EN]->(c:Ciudad)
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
      `MATCH (p:Persona {id: $id}) DELETE p`,
      { id}
    );
    res.json({ message: 'Persona eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};




module.exports = {
    createPersona,
    getAllPersonas,
    getPersonaById,
    updatePersona,
    deletePersona
  };
