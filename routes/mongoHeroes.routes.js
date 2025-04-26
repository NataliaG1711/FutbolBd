const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { existeHeroePorId } = require('../helpers/db-validators');
const { 
    heroesGet,
    heroesPut,
    heroesPost,
    heroesDelete,
    heroeGetById
} = require('../controllers/mongoHeroes.controller');

const router = Router();

// Obtener todos los héroes
router.get('/', [
    validarJWT,
    validarCampos
], heroesGet);

// Actualizar héroe
router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeHeroePorId),
    check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
    check('bio', 'La biografía es obligatoria').optional().not().isEmpty(),
    check('aparicion', 'La fecha de aparición es obligatoria').optional().not().isEmpty(),
    check('casa', 'Casa no válida').optional().isIn(['Marvel', 'DC']),
    validarCampos
], heroesPut);

// Crear héroe
router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('bio', 'La biografía es obligatoria').not().isEmpty(),
    check('aparicion', 'La fecha de aparición es obligatoria').not().isEmpty(),
    check('casa', 'Casa no válida').isIn(['Marvel', 'DC']),
    validarCampos
], heroesPost);

// Eliminar héroe
router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeHeroePorId),
    validarCampos
], heroesDelete);

router.get('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeHeroePorId),
    validarCampos
], heroeGetById);

module.exports = router;