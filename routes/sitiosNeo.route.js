const { Router } = require('express');
const { check } = require('express-validator');
const {existeCiudadPorNombreNeo} = require('../helpers/db-validators')
const { validarJWT } = require('../middlewares/validar-jwt');
const {validarRolAdmin} = require('../middlewares/validar-rol');

const {
  createSitio,
  getAllSitios,
  getSitioById,
  updateSitio,
  deleteSitio
} = require('../controllers/sitiosNeo.controller');

const router = Router();

/**
 * Rutas para /api/sitiosNeo
 */

// Obtener todos los sitios
router.get('/', getAllSitios);

// Obtener sitio por ID
router.get('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
], getSitioById);

// Crear sitio
router.post('/', [
  validarJWT,
  //validarRolAdmin,
  check('ubicacion').custom( existeCiudadPorNombreNeo ),
  check('id', 'El id es obligatorio').not().isEmpty(),
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('tipo', 'El tipo es obligatorio').not().isEmpty(),
  check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
  check('ubicacion', 'La ubicación es obligatoria').not().isEmpty(),
], createSitio);

// Actualizar sitio por ID
router.put('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
  check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
  check('tipo', 'El tipo es obligatorio').optional().not().isEmpty(),
  check('descripcion', 'La descripción es obligatoria').optional().not().isEmpty(),
  check('ubicacion', 'La ubicación es obligatoria').optional().not().isEmpty(),
], updateSitio);

// Eliminar sitio por ID
router.delete('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
], deleteSitio);

module.exports = router;
