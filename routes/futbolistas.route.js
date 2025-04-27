const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos} = require('../middlewares');

const { crearFutbolista,
        obtenerFutbolistas,
        obtenerFutbolista,
        actualizarFutbolista, 
        borrarFutbolista } = require('../controllers/futbolistas.controller');
const { existeFutbolistaPorId } = require('../helpers/db-validators');

const router = Router();


/**
 * {{url}}/api/GrupoMultimedias
 */

//  Obtener todas las contrataciones - publico
router.get('/', obtenerFutbolistas );


// Obtener una contratacion por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeFutbolistaPorId ),
    validarCampos,
], obtenerFutbolista );

// Crear contratacion - privado - cualquier persona con un token válido
router.post('/', [ 
    validarJWT,
    check('nombre','El nombre del futbolista es obligatorio').not().isEmpty(),
    check('apellidos','el apellido del futbolista es obligatorio').not().isEmpty(),
    check('edad','la edad es obligatorio').not().isEmpty(),
    check('fecha_nacimiento','la fecha de nacimiento obligatorio').not().isEmpty(),
    check('pais_nacimiento','el pais de nacimiento obligatorio').not().isEmpty(),
    check('equipo_actual','el equipo actual es obligatorio').not().isEmpty(),
    validarCampos
], crearFutbolista );

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    validarJWT,
    //check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeFutbolistaPorId ),
    validarCampos
],actualizarFutbolista );

// Borrar una GrupoMultimedia - Admin
router.delete('/:id',[
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeFutbolistaPorId ),
    validarCampos,
],borrarFutbolista);


module.exports = router;