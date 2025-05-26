const { Router } = require('express');
const {
  createVisita,
  getVisitasByUsuario,
  updateVisita,
  deleteVisita
} = require('../controllers/visitas.controller');

const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

// Crear una visita
router.post('/',
  validarCampos,
  createVisita
);

// Obtener todas las visitas de un usuario
router.get('/:usuarioId',
  getVisitasByUsuario
);

// Actualizar una visita
router.put('/:usuarioId/:sitioId',
  validarCampos,
  updateVisita
);

// Eliminar una visita
router.delete('/:usuarioId/:sitioId',
  deleteVisita
);

module.exports = router;
