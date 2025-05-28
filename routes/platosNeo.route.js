require('../controllers/platosNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existeSitioPorNombreNeo} = require('../helpers/db-validators');
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
    check('sitio').custom( existeSitioPorNombreNeo ),
    validarCampos,
    createPlato);


router.get('/', getAllPlatos);
router.get('/:id', getPlatoById);
router.put('/:id', updatePlato);
router.delete('/:id', deletePlato);


module.exports = router;
