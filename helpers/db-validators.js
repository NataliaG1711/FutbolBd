const { Usuario} = require("../models/mongoUsuario.model");
const {Heroe} = require('../models/mongoHeroe.model');
const Contratacion = require('../models/contrataciones')
const Equipo = require('../models/equipos')
const Futbolista = require('../models/futbolistas')
const Pais = require('../models/paises')

const existeUsuarioPorId = async (id) => {
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
      throw new Error(`El id no existe ${id}`);
    }
  };

  
const existeHeroePorId = async (id = '') => {
    const existeHeroe = await Heroe.findById(id);
    if (!existeHeroe) {
        throw new Error(`El héroe con id ${id} no existe`);
    }
    return true;
};

const existeContratacionPorId = async (id = '') => {
  const existeContratacion = await Contratacion.findById(id);
  if (!existeContratacion) {
      throw new Error(`La contratacion con id ${id} no existe`);
  }
  return true;
};

const existeEquipoPorId = async (id = '') => {
  const existeEquipo = await Equipo.findById(id);
  if (!existeEquipo) {
    throw new Error(`El equipo con id ${id} no existe`);
}
return true;
}

const existeFutbolistaPorId = async (id = '') => {
  const existeFutbolista = await Futbolista.findById(id);
  if (!existeFutbolista) {
    throw new Error(`El futbolista con id ${id} no existe`);
}
return true;
}

const existePaisPorId = async (id = '') => {
  const existePais = await Pais.findById(id);
  if (!existePais) {
    throw new Error(`El pais con id ${id} no existe`);
}
return true;
}

const existePaisPorIdNeo = async (id) => {
  // Verificar si el correo existe
  //const existeMultimediaHeroe = await MultimediaHeroe.findById(id);
  //if (!existeMultimediaHeroe) {
  //  throw new Error(`El id no existe ${id}`);
  //}
  const session = driver.session();


  try {
    const result = await session.run(
      'MATCH (p:Pais {id: $id}) RETURN p',
      { id: id }
    );
    if (!result.records.length) {
      throw new Error(`El id no existe ${id}`);
 
    }
    } catch (error) {
    throw new Error(`Error: ${error.message}`);
  } finally {
    await session.close();
  }

};

const existeCiudadPorIdNeo = async (id) => {
  const session = driver.session();
  try{
    const result = await session.run(
      'MATCH (c:Ciudad {id: $id} RETURN p',
      {id: id}
    );
    if (!result.records.length){
      throw new Error(`El id no existe ${id}`);
    }
  } catch (error){
    throw new Error(`Error: ${error.message}`)
  } finally {
    await session.close();
  }
};


module.exports = {
  existeUsuarioPorId,
  existeHeroePorId,
  existeContratacionPorId,
  existeEquipoPorId,
  existeFutbolistaPorId,
  existePaisPorId,
  existePaisPorIdNeo,
  existeCiudadPorIdNeo
};