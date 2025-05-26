const { Router } = require('express');
const { check } = require('express-validator');

const {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario
} = require('../controllers/usuariosNeo.controller');

const router = Router();

/**
 * Rutas para /api/usuarios
 */

// Obtener todos los usuarios (público)
router.get('/', getAllUsuarios);

// Obtener usuario por ID (público)
router.get('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
  // Puedes agregar más validaciones si quieres, por ejemplo formato UUID, etc.
], getUsuarioById);

// Crear usuario (privado, aquí podrías agregar middleware de autenticación)
router.post('/', [
  check('id', 'El id es obligatorio').not().isEmpty(),
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('rol', 'El rol es obligatorio').not().isEmpty(),
  check('correo', 'El correo es obligatorio').isEmail(),
  check('password', 'La contraseña es obligatoria').not().isEmpty(),
], createUsuario);

// Actualizar usuario por ID (privado)
router.put('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
  check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
  check('rol', 'El rol es obligatorio').optional().not().isEmpty(),
  check('correo', 'El correo debe ser válido').optional().isEmail(),
  check('password', 'La contraseña es obligatoria').optional().not().isEmpty(),
], updateUsuario);

// Eliminar usuario por ID (privado)
router.delete('/:id', [
  check('id', 'El id es obligatorio').not().isEmpty(),
], deleteUsuario);

module.exports = router;
