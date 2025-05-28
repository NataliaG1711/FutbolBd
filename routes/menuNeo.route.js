const { Router } = require('express');
const { validarCampos } = require('../middlewares/validar-campos');
const {existeSitioPorNombreNeo} = require('../helpers/db-validators')
const { validarJWT } = require('../middlewares/validar-jwt');
const {validarRolAdmin} = require('../middlewares/validar-rol');

const {
  createMenu,
  getAllMenus,
  updateMenu,
  deleteMenu,
  getMenuById
} = require('../controllers/menu_sitioNeo.controller');

const router = Router();

router.post('/',
  existeSitioPorNombreNeo,
  validarJWT,
  //validarRolAdmin,
  validarCampos,
  createMenu
);

router.get('/', getAllMenus);
router.get('/:id', getMenuById)
// Eliminación por ID
router.delete('/:id', deleteMenu);
router.put('/:id', updateMenu);

module.exports = router;
