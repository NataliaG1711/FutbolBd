const { Router } = require('express');
const { validarCampos } = require('../middlewares/validar-campos');

const {
  createMenu,
  getAllMenus,
  updateMenu,
  deleteMenu
} = require('../controllers/menu_sitioNeo.controller');

const router = Router();

router.post('/',
  validarCampos,
  createMenu
);

router.get('/', getAllMenus);

// Eliminación por ID
router.delete('/:id', deleteMenu);
router.put('/:id', updateMenu);

module.exports = router;
