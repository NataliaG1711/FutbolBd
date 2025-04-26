const { response, request } = require("express");
const Heroe = require("../models/mongoHeroe.model");
const Usuario = require("../models/mongoUsuario.model"); 

const heroesPost = async (req, res = response) => {
    const { nombre, bio, img, aparicion, casa } = req.body;
    
    try {

        const usuarioAutenticadoId = req.usuario._id;
        

        const usuario = await Usuario.findById(usuarioAutenticadoId);
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no existe en la BD'
            });
        }

  
        const heroe = new Heroe({ 
            nombre,
            bio,
            img,
            aparicion,
            casa
        });

        await heroe.save();

        res.json({
            ok: true,
            msg: 'Héroe creado correctamente',
            heroe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear héroe',
            error: error.message 
        });
    }
};

const heroesGet = async (req = request, res = response) => {
  try {
    const heroes = await Heroe.find({});

    res.json({
      ok: true,
      data: heroes,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

const heroeGetById = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const heroe = await Heroe.findById(id);
        
        if (!heroe) {
            return res.status(404).json({
                ok: false,
                msg: 'Héroe no encontrado'
            });
        }

        res.json({
            ok: true,
            heroe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el héroe',
            error
        });
    }
};

const heroesPut = async (req, res = response) => {
    const { id } = req.params;
    const { _id, estado, fecha_creacion, ...resto } = req.body;

    try {
  
        if (resto.casa && !['Marvel', 'DC'].includes(resto.casa)) {
            return res.status(400).json({
                msg: 'La casa debe ser Marvel o DC'
            });
        }

        // Actualizar fecha de modificación
        resto.fecha_actualizacion = Date.now();

        const heroe = await Heroe.findByIdAndUpdate(id, resto, { new: true });

        res.json({
            ok: true,
            msg: 'Héroe actualizado correctamente',
            heroe
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar héroe',
            error
        });
    }
};

const heroesDelete = async (req, res = response) => {
    const { id } = req.params;

    try {
        const heroe = await Heroe.findByIdAndUpdate(
            id, 
            { 
                estado: false,
                fecha_actualizacion: Date.now() 
            }, 
            { new: true }
        );

        res.json({
            ok: true,
            msg: 'Héroe desactivado correctamente',
            heroe
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al desactivar héroe',
            error
        });
    }
};

module.exports = {
    heroesPost,
    heroesGet,
    heroesPut,
    heroesDelete,
    heroeGetById
};