const { driver } = require('../database/Neo4jConnection');

// Crear una visita
const createVisita = async (req, res) => {
  const { id, usuario, sitio, fecha, hora, favorito } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `CREATE (v:Visita {
        id: $id,
        usuario: $usuario,
        sitio: $sitio
      })`,
      { id, usuario, sitio }
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
      { usuario: req.params.nombre }
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

const getVisitaById = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (v:Visita {id: $id}) RETURN v`,
      { id }
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Visita no encontrada' });
    }
    res.json(result.records[0].get('v').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar una visita (solo propiedades de la relación)
const updateVisita = async (req, res) => {
  const { usuarioId, sitioId } = req.params;
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
  const { usuarioId, sitioId } = req.params;
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

// Crear ruta planificada solo con sitios favoritos y horarios nuevos
const createRutaPlanificadaConFavoritos = async (req, res) => {
  const { usuario, fecha, horarios } = req.body;
  // horarios = [{ sitio: "Sitio 1", hora_inicio: "14:00", hora_fin: "15:00" }, ...]

  const session = driver.session();
  try {
    for (const h of horarios) {
      // Verificar si el sitio es favorito
      const checkFav = await session.run(
        `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO {favorito: true}]->(s:Sitio {nombre: $sitio})
         RETURN s`,
        { usuario, sitio: h.sitio }
      );

      if (checkFav.records.length === 0) {
        // No es favorito, no agregarlo a la ruta planificada
        continue;
      }

      // Crear relación VISITARA con el horario planificado
      await session.run(
        `MATCH (u:Usuario {nombre: $usuario}), (s:Sitio {nombre: $sitio})
         CREATE (u)-[:VISITARA {
           fecha: $fecha,
           hora_inicio: $hora_inicio,
           hora_fin: $hora_fin
         }]->(s)`,
        {
          usuario,
          sitio: h.sitio,
          fecha,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin
        }
      );
    }

    res.status(201).json({ message: 'Ruta planificada creada con sitios favoritos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createVisita,
  getVisitasByUsuario,
  getVisitaById,
  updateVisita,
  deleteVisita,
  createRutaPlanificadaConFavoritos
};
