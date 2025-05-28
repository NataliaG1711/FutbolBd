const { driver } = require('../database/Neo4jConnection');

// Crear un menú
const createMenu = async (req, res) => {
  const { id, sitioId, platos, valorTotal } = req.body;
  const session = driver.session();
  try {
    // Crear nodo de menú
    await session.run(
      `CREATE (m:Menu { id: $id, valorTotal: $valorTotal })`,
      { id, valorTotal }
    );

    // Crear relación con sitio
    await session.run(
      `MATCH (s:Sitio {id: $sitioId}), (m:Menu {id: $id})
       CREATE (s)-[:OFRECE_MENU]->(m)`,
      { sitioId, id }
    );

    // Crear relaciones con platos
    for (const platoId of platos) {
      await session.run(
        `MATCH (p:Plato {id: $platoId}), (m:Menu {id: $menuId})
         CREATE (m)-[:INCLUYE_PLATO]->(p)`,
        { platoId, menuId: id }
      );
    }

    res.status(201).json({ message: 'Menú creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener menú por ID
const getMenuById = async (req, res) => {
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (m:Menu {id: $id}) RETURN m`,
      { id }
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }
    res.json(result.records[0].get('m').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Obtener todos los menús
const getAllMenus = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Menu)<-[:OFRECE_MENU]-(s:Sitio)
       OPTIONAL MATCH (m)-[:INCLUYE_PLATO]->(p:Plato)
       RETURN m, s, collect(p) as platos`
    );

    const menus = result.records.map(record => ({
      menu: record.get('m').properties,
      sitio: record.get('s').properties,
      platos: record.get('platos').map(p => p.properties)
    }));

    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Actualizar un menú
const updateMenu = async (req, res) => {
  const { valorTotal, platos } = req.body;
  const id = parseInt(req.params.id);
  const session = driver.session();

  try {
    // Actualizar valor total
    await session.run(
      `MATCH (m:Menu {id: $id})
       SET m.valorTotal = $valorTotal`,
      { id, valorTotal }
    );

    // Eliminar relaciones anteriores con platos
    await session.run(
      `MATCH (m:Menu {id: $id})-[r:INCLUYE_PLATO]->() DELETE r`,
      { id }
    );

    // Crear nuevas relaciones con platos
    for (const platoId of platos) {
      await session.run(
        `MATCH (p:Plato {id: $platoId}), (m:Menu {id: $menuId})
         CREATE (m)-[:INCLUYE_PLATO]->(p)`,
        { platoId, menuId: id }
      );
    }

    res.json({ message: 'Menú actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Eliminar un menú
const deleteMenu = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    await session.run(
      `MATCH (m:Menu {id: $id}) DETACH DELETE m`,
      { id }
    );
    res.json({ message: 'Menú eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu
};
