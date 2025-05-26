// controllers/UsuarioController.js
const {driver} = require('../database/Neo4jConnection');


const createUsuario = async (req, res) => {
  const { id, nombre, rol, correo, password } = req.body;
  const session = driver.session();
  try {
   
    //Crea la Usuario
    await session.run(
      `CREATE (p:Usuario {
        id: $id,
        nombre: $nombre,
        rol: $rol,
        correo: $correo,
        password: $password
      })`,
      { id, nombre, rol, correo, password }
    );


 
    res.status(201).json({ message: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id}) RETURN p`,
      { id: req.params.id }
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
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id})
       SET p.nombre = $nombre,
           p.rol = $rol,
           p.correo = $correo,
           p.password = $password
       RETURN p`,
      {
        id: req.params.id,
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
  try {
    const result = await session.run(
      `MATCH (p:Usuario {id: $id}) DETACH DELETE p`,
      { id: req.params.id }
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
