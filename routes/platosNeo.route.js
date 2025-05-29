require('../controllers/platosNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existeCiudadPorNombreNeo} = require('../helpers/db-validators');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const {validarRolAdmin} = require('../middlewares/validar-rol');

const { Router } = require('express');
const { createPlato,
    getAllPlatos,
    getPlatoById,
    updatePlato,
    deletePlato
    } = require('../controllers/platosNeo.controller');


const router = Router();


router.post('/',
    validarJWT,
    validarRolAdmin,
    check('ciudad').custom( existeCiudadPorNombreNeo ),
    validarCampos,
    createPlato);


router.get('/', getAllPlatos);
router.get('/:id', getPlatoById);
router.put('/:id', updatePlato);
router.delete('/:id', deletePlato);


module.exports = router;
