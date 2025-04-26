const { Router } = require('express');
const { check } = require('express-validator');
const { login } = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();


router.post('/login',[
    //Que me pase un correo que sea correo
    check('correo','El correo es obligatorio').isEmail(),
    //Que me proporcionen un contraseña
    check('password','La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login);

module.exports = router;