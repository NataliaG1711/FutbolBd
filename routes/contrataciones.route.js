const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT} = require('../middlewares/validar-jwt');
const {validarCampos} = require('../middlewares/validar-campos');

const { crearContratacion,
        obtenerContrataciones,
        obtenerContratacion,
        actualizarContratacion, 
        borrarContratacion } = require('../controllers/contrataciones.controller');
const { existeContratacionPorId } = require('../helpers/db-validators');

const router = Router();


/**
 * {{url}}/api/GrupoMultimedias
 */

//  Obtener todas las contrataciones - publico
router.get('/', obtenerContrataciones );


// Obtener una contratacion por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeContratacionPorId ),
    validarCampos,
], obtenerContratacion );

// Crear contratacion - privado - cualquier persona con un token válido
router.post('/', [ 
    validarJWT,
    check('IdJugador','El id del jugador es obligatorio').not().isEmpty(),
    check('IdEquipo','El id del equipo es obligatorio').not().isEmpty(),
    check('fecha_contratacion','La fecha de la contratacion es obligatoria').not().isEmpty(),
    check('monto_contratacion','El monto es obligatorio').not().isEmpty(),
    validarCampos
], crearContratacion );

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    validarJWT,
    //check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeContratacionPorId ),
    validarCampos
],actualizarContratacion );

// Borrar una GrupoMultimedia - Admin
router.delete('/:id',[
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeContratacionPorId ),
    validarCampos,
],borrarContratacion);


module.exports = router;