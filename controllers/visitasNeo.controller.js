const { driver } = require('../database/Neo4jConnection');

// Crear una visita
const createVisita = async (req, res) => {
  const { id,usuario, sitio, fecha, hora, favorito } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `CREATE (v:Visita{
      id: $id,
      usuario: $usuario,
      sitio: $sitio
      })`,
      {id,usuario,sitio}
    );

    // Crear relación VISITO con propiedades
    await session.run(
      `MATCH (u:Usuario {nombre: $usuario}), (s:Sitio {nombre: $sitio})
       CREATE (u)-[:VISITO {
         fecha: $fecha,
         hora: $hora,
         favorito: $favorito
       }]->(s)`,
      { usuario, sitio, fecha, hora, favorito }
    );

    res.status(201).json({ message: 'Visita registrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todas las visitas de un usuario
const getVisitasByUsuario = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO]->(s:Sitio)
       RETURN v, s`,
      { usuario: req.params.nombre}
    );

    const visitas = result.records.map(record => ({
      sitio: record.get('s').properties,
      visita: record.get('v').properties
    }));

    res.json(visitas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

const getVisitaById = async (req,res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try{
    const result = await session.run(
      `MATCH (v: Visita {id: $id}) return v`
    );
    if (!result.records.length){
      return res.status(404).json({message: 'Visita no encontrado'})
    }
    res.json(result.records[0].get('v').properties); //ASUMO QUE OBTENER LAS PROPIEDADES DE USUARIOS Y SITIOS??
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
}

// Actualizar una visita (solo propiedades de la relación)
const updateVisita = async (req, res) => {
  const { usuarioId, sitioId } = parseInt(req.params);
  const { fecha, hora, favorito } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {id: $usuarioId})-[v:VISITO]->(s:Sitio {id: $sitioId})
       SET v.fecha = $fecha,
           v.hora = $hora,
           v.favorito = $favorito`,
      { usuarioId, sitioId, fecha, hora, favorito }
    );
    res.json({ message: 'Visita actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar una visita
const deleteVisita = async (req, res) => {
  const { usuarioId, sitioId } = parseInt(req.params);
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {id: $usuarioId})-[v:VISITO]->(s:Sitio {id: $sitioId})
       DELETE v`,
      { usuarioId, sitioId }
    );
    res.json({ message: 'Visita eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createVisita,
  getVisitasByUsuario,
  updateVisita,
  deleteVisita
};
