const jwt = require('jsonwebtoken');
const { driver } = require('../database/Neo4jConnection');

const validarJWT = async (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const session = driver.session();
        
        const result = await session.run(
            `MATCH (u:Usuario {id: $uid}) 
             RETURN u`,
            { uid }
        );

        if (result.records.length === 0) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe'
            });
        }

        const usuario = result.records[0].get('u').properties;

        // Verificar estado si existe
        if (usuario.estado === false) {
            return res.status(401).json({
                msg: 'Token no válido - usuario inactivo'
            });
        }

        req.usuario = usuario;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        });
    }
};

module.exports = {
    validarJWT
};