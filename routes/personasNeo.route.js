require('../controllers/personasNeo.controller');
const {validarCampos} = require('../middlewares/validar-campos');
const { existeCiudadPorNombreNeo} = require('../helpers/db-validators');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const {validarRolAdmin} = require('../middlewares/validar-rol');

const { Router } = require('express');
const { createPersona,
    getAllPersonas,
    getPersonaById,
    updatePersona,
    deletePersona
    } = require('../controllers/personasNeo.controller');


const router = Router();


router.post('/',
    validarJWT,
    validarRolAdmin,
    check('ciudad').custom( existeCiudadPorNombreNeo ),
    validarCampos,
    createPersona);


router.get('/', getAllPersonas);
router.get('/:id', getPersonaById);
router.put('/:id', updatePersona);
router.delete('/:id', deletePersona);


module.exports = router;
