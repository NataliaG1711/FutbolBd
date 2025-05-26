require('../controllers/platosNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existeCiudadPorIdNeo} = require('../helpers/db-validators');
const { check } = require('express-validator');


const { Router } = require('express');
const { createPlato,
    getAllPlatos,
    getPlatoById,
    updatePlato,
    deletePlato
    } = require('../controllers/platosNeo.controller');


const router = Router();


router.post('/',
    check('IdCiudad').custom( existeCiudadPorIdNeo ),
    validarCampos,
    createPlato);


router.get('/', getAllPlatos);
router.get('/:id', getPlatoById);
router.put('/:id', updatePlato);
router.delete('/:id', deletePlato);


module.exports = router;
