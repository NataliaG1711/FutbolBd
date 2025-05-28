const { Router } = require('express');
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag
} = require('../controllers/tagsNeoController');

const { validarCampos } = require('../middlewares/validar-campos');
// const { validarJWT } = require('../middlewares/validar-jwt');
// const { validarRolAdmin } = require('../middlewares/validar-rol');

const router = Router();

// Crear un tag (cualquiera puede crear)
router.post('/',
  //validarJWT,
  //validarRolAdmin,
  validarCampos,
  createTag
);

// Obtener todos los tags
router.get('/',
  getAllTags
);

// Obtener tag por ID
router.get('/:id',
  getTagById
);

// Actualizar un tag
router.put('/:id',
  validarCampos,
  updateTag
);

// Eliminar un tag
router.delete('/:id',
  deleteTag
);

module.exports = router;
