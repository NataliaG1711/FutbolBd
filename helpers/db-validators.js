const { Usuario} = require("../models/mongoUsuario.model");

const existeUsuarioPorId = async (id) => {
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
      throw new Error(`El id no existe ${id}`);
    }
  };

  module.exports = {
     existeUsuarioPorId,
   };
  
const Heroe = require('../models/mongoHeroe.model');

const existeHeroePorId = async (id = '') => {
    const existeHeroe = await Heroe.findById(id);
    if (!existeHeroe) {
        throw new Error(`El héroe con id ${id} no existe`);
    }
    return true;
};

module.exports = {
    existeHeroePorId
};