// controllers/UsuarioController.js
const {driver} = require('../database/Neo4jConnection');
const {generarJWT} = require('../helpers/generar-jwt')
const bcryptjs = require('bcryptjs');


const createUsuario = async (req, res) => {
  const { id, nombre, rol, correo, password } = req.body;
  const session = driver.session();

  try {
    // Verificar si el correo ya existe
    const result = await session.run(
      `MATCH (u:Usuario {correo: $correo}) RETURN u`,
      { correo }
    );

    if (result.records.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: 'El correo ya está registrado...',
      });
    }

    // Encriptar contraseña
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(password, salt);

    // Crear el usuario
    const createResult = await session.run(
      `CREATE (u:Usuario {
        id: $id,
        nombre: $nombre,
        rol: $rol,
        correo: $correo,
        password: $password
      }) RETURN u`,
      {
        id,
        nombre,
        rol,
        correo,
        password: hashedPassword,
      }
    );
    
    const usuario = createResult.records[0].get('u').properties;
    
    res.status(201).json({
      ok: true,
      usuario,
      msg: 'Usuario creado correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false,
      error: error.message 
    });
  } finally {
    await session.close();
  }
};


const getAllUsuarios = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Usuario) RETURN p');
    const Usuarios = result.records.map(record => record.get('p').properties);
    res.json(Usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const getUsuarioById = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id}) RETURN p`,
      { id}
    );
    if (!result.records.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.records[0].get('p').properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};


const updateUsuario = async (req, res) => {
  const { nombre, rol, correo, password } = req.body;
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id})
       SET p.nombre = $nombre,
           p.rol = $rol,
           p.correo = $correo,
           p.password = $password
       RETURN p`,
      {
        id,
        nombre,
        rol,
        correo,
        password
      }
    );

    if (!result.records.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};



const deleteUsuario = async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id}) DETACH DELETE p`,
      { id}
    );

    if (result.summary.counters.updates().nodesDeleted === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};




module.exports = {
    createUsuario,
    getAllUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario
  };
