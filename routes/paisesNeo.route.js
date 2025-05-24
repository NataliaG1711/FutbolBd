require('../controllers/paisesNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
//const { check } = require('express-validator');


const { Router } = require('express');
const { createPais,
    getAllPaises,
    getPaisById,
    updatePais,
    deletePais
    } = require('../controllers/paisesNeo.controller');


const router = Router();


router.post('/',
    validarCampos,
    createPais);


router.get('/', getAllPaises);
router.get('/:id', getPaisById);
router.put('/:id', updatePais);
router.delete('/:id', deletePais);


module.exports = router;
