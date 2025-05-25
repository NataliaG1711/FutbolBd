// controllers/PlatoController.js
const {driver} = require('../database/Neo4jConnection');


const createPlato = async (req, res) => {
  const { id, nombre, tipo, descripcion, ciudad} = req.body;
  const session = driver.session();
  try {
    //Crea el plato
    await session.run(
      `CREATE (p:Plato {
        id: $id,
        nombre: $nombre,
        tipo: $tipo,
        descripcion: $descripcion,
        ciudad: $ciudad
      })`,
      { id, nombre, tipo, descripcion, ciudad }
    );


    //Estable la relacion con el pais donde nacio
    await session.run(
      `MATCH (p:Plato {id: $id}), (c:Ciudad {nombre: $ciudad})
       CREATE (p)-[:COMIDA_TIPICA]->(c)`,
      { id,ciudad}
    );
 
    res.status(201).json({ message: 'Plato creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const getAllPlatos = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Plato) RETURN p');
    const Platos = result.records.map(record => record.get('p').properties);
    res.json(Platos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const getPlatoById = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Plato {id: $id}) RETURN p`,
      { id: req.params.id }
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Plato no encontrada' });
    }
    res.json(result.records[0].get('p').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const updatePlato = async (req, res) => {
  const { nombre, tipo, descripcion, ciudad } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (p:Plato {id: $id})
       SET p.nombre = $nombre,
           p.tipo = $tipo,
           p.descripcion = $descripcion,
           p.ciudad = $ciudad`,
      {
        id: req.params.id,
        nombre,
        tipo,
        descripcion,
        ciudad
      }
    );
    res.json({ message: 'Plato actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const deletePlato = async (req, res) => {
  const session = driver.session();
  try {

    await session.run(
      `MATCH (p:Plato {id: $id})-[r:COMIDA_TIPICA]->(c:Ciudad)
      DELETE r`,
      { id: req.params.id }
    );


    //DETACH
    /*
    await session.run(
      `MATCH (p:Plato {id: $id}) DETACH DELETE p`,
      { id: req.params.id }
    );
    */


    await session.run(
      `MATCH (p:Plato {id: $id}) DELETE p`,
      { id: req.params.id }
    );
    res.json({ message: 'Plato eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};




module.exports = {
    createPlato,
    getAllPlatos,
    getPlatoById,
    updatePlato,
    deletePlato
  };
