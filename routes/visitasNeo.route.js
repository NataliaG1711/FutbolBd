const { Router } = require('express');
const {
  createVisita,
  getVisitasByUsuario,
  updateVisita,
  deleteVisita,
  createRutaPlanificadaConFavoritos
} = require('../controllers/visitasNeo.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarRolAdmin } = require('../middlewares/validar-rol');
const router = Router();

// Crear una visita
router.post('/',
  //validarJWT, // Puede ser público
  //validarRolAdmin,
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

// Crear ruta planificada solo con sitios favoritos y horarios nuevos
router.post('/ruta-planificada',
  //validarJWT, // Puedes activar si quieres proteger esta ruta
  validarCampos,
  createRutaPlanificadaConFavoritos
);

module.exports = router;
