const validarRolAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(500).json({
      msg: 'Se quiere verificar el rol sin validar el token primero'
    });
  }

  const { rol, nombre } = req.usuario;

  if (rol !== 'ADMIN_ROLE') {
    return res.status(403).json({
      msg: `El usuario ${nombre} no tiene permisos para realizar esta acción`
    });
  }

  next();
};

module.exports = {
  validarRolAdmin
};
