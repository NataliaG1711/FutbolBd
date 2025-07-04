const { driver } = require('../database/Neo4jConnection');

// Crear una visita
const createVisita = async (req, res) => {
  const { usuario, sitio, fecha, hora, favorito } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {nombre: $usuario}), (s:Sitio {nombre: $sitio})
       CREATE (u)-[:VISITO {
         fecha: $fecha,
         hora: $hora,
         favorito: $favorito
       }]->(s)`,
      { usuario, sitio, fecha, hora, favorito }
    );
    res.status(201).json({ message: 'Visita registrada correctamente' });
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

// Obtener una visita específica por nombre de usuario y nombre del sitio
const getVisita = async (req, res) => {
  const { usuario, sitio } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO]->(s:Sitio {nombre: $sitio})
       RETURN v`,
      { usuario, sitio }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Visita no encontrada' });
    }

    res.json(result.records[0].get('v').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar una visita
const updateVisita = async (req, res) => {
  const { usuario, sitio } = req.params;
  const { fecha, hora, favorito } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO]->(s:Sitio {nombre: $sitio})
       SET v.fecha = $fecha,
           v.hora = $hora,
           v.favorito = $favorito
       RETURN v`,
      { usuario, sitio, fecha, hora, favorito }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'Visita no encontrada para actualizar' });
    }

    res.json({ message: 'Visita actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar una visita
const deleteVisita = async (req, res) => {
  const { usuario, sitio } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO]->(s:Sitio {nombre: $sitio})
       DELETE v`,
      { usuario, sitio }
    );

    res.json({ message: 'Visita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Crear ruta planificada solo con sitios favoritos y horarios nuevos
const createRutaPlanificadaConFavoritos = async (req, res) => {
  const { usuario, fecha } = req.body;
  const session = driver.session();

  try {
    // Validar body
    if (!usuario || !fecha) {
      return res.status(400).json({ error: 'Faltan usuario o fecha' });
    }

    // Obtener todos los sitios favoritos del usuario
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $usuario})-[v:VISITO {favorito: true}]->(s:Sitio)
       RETURN s.nombre AS sitio`,
      { usuario }
    );

    const favoritos = result.records.map(record => record.get('sitio'));
    if (favoritos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron sitios favoritos para el usuario' });
    }

    // Generar horarios automáticamente (ejemplo: 1 hora por sitio, empezando a las 09:00)
    const horarios = [];
    let currentTime = 9 * 60; // 09:00 en minutos
    const durationPerSite = 60; // 1 hora por sitio en minutos

    for (const sitio of favoritos) {
      const horaInicio = formatTime(currentTime);
      const horaFin = formatTime(currentTime + durationPerSite);
      horarios.push({ sitio, hora_inicio: horaInicio, hora_fin: horaFin });
      currentTime += durationPerSite;
    }

    // Crear relaciones VISITARA para cada sitio favorito
    const tx = session.beginTransaction();
    try {
      for (const h of horarios) {
        await tx.run(
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
      await tx.commit();
      res.status(201).json({
        message: 'Ruta planificada creada con sitios favoritos',
        ruta: horarios
      });
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Función auxiliar para formatear tiempo en minutos a HH:mm
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

module.exports = {
  createVisita,
  getVisitasByUsuario,
  getVisita,
  updateVisita,
  deleteVisita,
  createRutaPlanificadaConFavoritos
};
