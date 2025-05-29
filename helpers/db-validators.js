
const { driver } = require('../database/Neo4jConnection');

const existePaisPorNombreNeo = async (nombre) => {
  const session = driver.session();

  try {
    const result = await session.run(
      'MATCH (p:Pais {nombre: $nombre}) RETURN p',
      { nombre }
    );

    if (!result.records.length) {
      throw new Error(`El país con nombre "${nombre}" no existe`);
    }
  } catch (error) {
    throw new Error(`Error al verificar país: ${error.message}`);
  } finally {
    await session.close();
  }
};


const existeCiudadPorNombreNeo = async (nombre) => {
  const session = driver.session();
  try{
    const result = await session.run(
      'MATCH (c:Ciudad {nombre: $nombre}) RETURN c',
      {nombre}
    );
    if (!result.records.length){
      throw new Error(`La ciudad con nombre ${nombre} no existe `);
    }
  } catch (error){
    throw new Error(`Error: ${error.message}`)
  } finally {
    await session.close();
  }
};

const existeSitioPorNombreNeo = async (nombre) => {
  const session = driver.session();
  try{
    const result = await session.run(
      'MATCH (s:Sitio {nombre: $nombre}) RETURN s',
      {nombre}
    );
    if (!result.records.length){
      throw new Error(`El sitio con nombre ${nombre} no existe`)
    }
  } catch (error){
    throw new Error(`Error: ${error.message}`)
  } finally {
    await session.close()
  }
}


module.exports = {
  existePaisPorNombreNeo,
  existeCiudadPorNombreNeo,
  existeSitioPorNombreNeo
};