const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos} = require('../middlewares');

const { crearPais,
        obtenerPais,
        obtenerPaises,
        actualizarPais, 
        borrarPais } = require('../controllers/paises.controller');
const { existePaisPorId } = require('../helpers/db-validators');

const router = Router();


/**
 * {{url}}/api/GrupoMultimedias
 */

//  Obtener todas las contrataciones - publico
router.get('/', obtenerPaises );


// Obtener una contratacion por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existePaisPorId ),
    validarCampos,
], obtenerPais );

// Crear contratacion - privado - cualquier persona con un token válido
router.post('/', [ 
    validarJWT,
    check('nombre','El nombre del pais es obligatorio').not().isEmpty(),
    check('continente','el continente es obligatorio').not().isEmpty(),
    validarCampos
], crearPais);

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    validarJWT,
    //check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existePaisPorId ),
    validarCampos
],actualizarPais );

// Borrar una GrupoMultimedia - Admin
router.delete('/:id',[
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existePaisPorId ),
    validarCampos,
],borrarPais);


module.exports = router;