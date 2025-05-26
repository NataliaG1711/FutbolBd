const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const {
  createPais,
  getAllPaises,
  getPaisById,
  updatePais,
  deletePais
} = require('../controllers/paisesNeo.controller');

const router = Router();

/**
 * Rutas para países (Neo4j)
 * Base URL: /api/paises
 */

// Obtener todos los países - público
router.get('/', getAllPaises);

// Obtener un país por nombre (o id si usas uno)
router.get('/:id', [
  check('id', 'El nombre del país es obligatorio').notEmpty(),
  validarCampos
], getPaisById);

// Crear país - privado (requiere token)
router.post('/', [
  validarJWT,
  check('nombre', 'El nombre del país es obligatorio').notEmpty(),
  check('continente', 'El continente es obligatorio').notEmpty(),
  validarCampos
], createPais);

// Actualizar país - privado
router.put('/:id', [
  validarJWT,
  check('id', 'El identificador del país es obligatorio').notEmpty(),
  check('nombre', 'El nombre es obligatorio').notEmpty(),
  check('continente', 'El continente es obligatorio').notEmpty(),
  validarCampos
], updatePais);

// Eliminar país - privado
router.delete('/:id', [
  validarJWT,
  check('id', 'El identificador del país es obligatorio').notEmpty(),
  validarCampos
], deletePais);

module.exports = router;
