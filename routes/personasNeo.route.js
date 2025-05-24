require('../controllers/personasNeo.controller');


const {validarCampos} = require('../middlewares/validar-campos');
const { existePaisPorIdNeo} = require('../helpers/db-validators');
//const { check } = require('express-validator');


const { Router } = require('express');
const { createPersona,
    getAllPersonas,
    getPersonaById,
    updatePersona,
    deletePersona
    } = require('../controllers/personasNeo.controller');


const router = Router();


router.post('/',
    check('IdPais').custom( existePaisPorIdNeo ),
    validarCampos,
    createPersona);


router.get('/', getAllPersonas);
router.get('/:id', getPersonaById);
router.put('/:id', updatePersona);
router.delete('/:id', deletePersona);


module.exports = router;
