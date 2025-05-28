require('../controllers/ciudadesNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existePaisPorNombreNeo} = require('../helpers/db-validators');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const {validarRolAdmin} = require('../middlewares/validar-rol');


const { Router } = require('express');
const { createCiudad,
        getAllCiudades,
        getCiudadById,
        updateCiudad,
        deleteCiudad
    } = require('../controllers/ciudadesNeo.controller');



const router = Router();


router.post('/',
    check('pais').custom( existePaisPorNombreNeo ),
    validarJWT,
    //validarRolAdmin,
    validarCampos,
    createCiudad);


router.get('/', getAllCiudades);
router.get('/:id', getCiudadById);
router.put('/:id', updateCiudad);
router.delete('/:id', deleteCiudad);


module.exports = router;
