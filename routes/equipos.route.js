const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos} = require('../middlewares');

const { crearEquipo,
        obtenerEquipos,
        obtenerEquipo,
        actualizarEquipo, 
        borrarEquipo } = require('../controllers/equipos.controller');
const { existeEquipoPorId } = require('../helpers/db-validators');

const router = Router();


/**
 * {{url}}/api/GrupoMultimedias
 */

//  Obtener todas las contrataciones - publico
router.get('/', obtenerEquipos );


// Obtener una contratacion por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeEquipoPorId ),
    validarCampos,
], obtenerEquipo );

// Crear contratacion - privado - cualquier persona con un token válido
router.post('/', [ 
    validarJWT,
    check('nombre_equipo','El nombre del equipo es obligatorio').not().isEmpty(),
    check('ciudad','la ciudad del equipo es obligatorio').not().isEmpty(),
    check('pais','el pais es obligatorio').not().isEmpty(),
    check('estadio','El estadio es obligatorio').not().isEmpty(),
    validarCampos
], crearEquipo );

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    validarJWT,
    //check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeEquipoPorId ),
    validarCampos
],actualizarEquipo );

// Borrar una GrupoMultimedia - Admin
router.delete('/:id',[
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeEquipoPorId ),
    validarCampos,
],borrarEquipo);


module.exports = router;