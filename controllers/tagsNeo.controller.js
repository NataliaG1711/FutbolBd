const { driver } = require('../database/Neo4jConnection');

// Crear un Tag
const createTag = async (req, res) => {
  const { id, famoso, comentario, sitioId } = req.body;
  const session = driver.session();

  try {
    // Crear el nodo Tag
    await session.run(
      `CREATE (t:Tag {
        id: $id,
        famoso: $famoso,
        comentario: $comentario
      })`,
      { id, famoso, comentario }
    );

    // Relacionarlo con el sitio
    await session.run(
      `MATCH (t:Tag {id: $id}), (s:Sitio {id: $sitioId})
       CREATE (t)-[:FOTO_EN]->(s)`,
      { id, sitioId }
    );

    res.status(201).json({ message: 'Tag creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todos los Tags
const getAllTags = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (t:Tag)-[:FOTO_EN]->(s:Sitio)-[:UBICADO_EN]->(c:Ciudad)-[:PERTENECE_A]->(p:Pais)
       RETURN t, s.nombre AS sitio, c.nombre AS ciudad, p.nombre AS pais`
    );

    const tags = result.records.map(record => ({
      ...record.get('t').properties,
      sitio: record.get('sitio'),
      ciudad: record.get('ciudad'),
      pais: record.get('pais')
    }));

    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener Tag por ID
const getTagById = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (t:Tag {id: $id})-[:FOTO_EN]->(s:Sitio)-[:UBICADO_EN]->(c:Ciudad)-[:PERTENECE_A]->(p:Pais)
       RETURN t, s.nombre AS sitio, c.nombre AS ciudad, p.nombre AS pais`,
      { id }
    );

    if (!result.records.length) {
      return res.status(404).json({ message: 'Tag no encontrado' });
    }

    const record = result.records[0];
    const tag = {
      ...record.get('t').properties,
      sitio: record.get('sitio'),
      ciudad: record.get('ciudad'),
      pais: record.get('pais')
    };

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar Tag
const updateTag = async (req, res) => {
  const { famoso, comentario } = req.body;
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (t:Tag {id: $id})
       SET t.famoso = $famoso,
           t.comentario = $comentario`,
      { id, famoso, comentario }
    );

    if (result.summary.counters.updates().propertiesSet === 0) {
      return res.status(404).json({ message: 'Tag no encontrado o sin cambios' });
    }

    res.json({ message: 'Tag actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar Tag
const deleteTag = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (t:Tag {id: $id})
       DETACH DELETE t`,
      { id }
    );

    if (result.summary.counters.updates().nodesDeleted === 0) {
      return res.status(404).json({ message: 'Tag no encontrado' });
    }

    res.json({ message: 'Tag eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag
};
