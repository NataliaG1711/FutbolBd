const { Router } = require('express');
const {
  createFamoso,
  getAllFamosos,
  getFamosoById,
  updateFamoso,
  deleteFamoso
} = require('../controllers/famososNeo.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { existeCiudadPorNombreNeo } = require('../helpers/db-validators');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarRolAdmin } = require('../middlewares/validar-rol');

const router = Router();

// Crear un famoso
router.post('/',
  validarJWT,
  validarRolAdmin,
  check('lugar_nacimiento').custom(existeCiudadPorNombreNeo),
  validarCampos,
  createFamoso
);

// Obtener todos los famosos
router.get('/', getAllFamosos);

// Obtener famoso por ID
router.get('/:id', getFamosoById);

// Actualizar famoso
router.put('/:id', updateFamoso);

// Eliminar famoso
router.delete('/:id', deleteFamoso);

module.exports = router;
