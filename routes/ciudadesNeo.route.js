require('../controllers/ciudadesNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existePaisPorIdNeo} = require('../helpers/db-validators');
const { check } = require('express-validator');


const { Router } = require('express');
const { createCiudad,
        getAllCiudades,
        getCiudadById,
        updateCiudad,
        deleteCiudad
    } = require('../controllers/ciudadesNeo.controller');


const router = Router();


router.post('/',
    check('IdPais').custom( existePaisPorIdNeo ),
    validarCampos,
    createCiudad);


router.get('/', getAllCiudades);
router.get('/:id', getCiudadById);
router.put('/:id', updateCiudad);
router.delete('/:id', deleteCiudad);


module.exports = router;
