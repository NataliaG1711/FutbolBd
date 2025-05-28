const { response } = require("express");
const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generar-jwt");
const { driver } = require("../database/Neo4jConnection");

const login = async (req, res = response) => {
  const { correo, password } = req.body;
  const session = driver.session();

  try {
    // Buscar usuario por correo
    const result = await session.run(
      `MATCH (u:Usuario {correo: $correo}) RETURN u LIMIT 1;`,
      { correo }
    );
    

    if (result.records.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario / Password no son correctos - correo: " + correo,
      });
    }

    const usuarioNode = result.records[0].get("u");
    const usuario = usuarioNode.properties;
    
    console.log("Usuario encontrado:", usuario); // Debug

    // Verificar contraseña
    const validaPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validaPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario / Password no son correctos - password",
      });
    }

    // Debug: Verificar que el ID existe
    if (!usuario.id) {
      return res.status(500).json({
        ok: false,
        msg: "El usuario no tiene ID",
        usuario
      });
    }

    // Generar JWT
    const token = await generarJWT(usuario.id);

    res.json({
      ok: true,
      msg: "Login ok",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el Administrador...",
      error: error.message,
    });
  } finally {
    await session.close();
  }
};

module.exports = {
  login,
};
