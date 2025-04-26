const { response } = require("express");
const { Equipos, Contrataciones, Futbolistas, Paises } = require("../models");
const { isValidObjectId } = require("../helpers/mongo-verify");
const { now } = require("mongoose");

const obtenerPaises = async (req, res = response) => {
  const { limite = 25, desde = 0 } = req.query;
  //const query = { estado: true };
  const query = {};

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .populate("usuario", "nombre")
        .populate("IdCategoria","nombre")
        .populate("IdProveedorMarca", "descripcion")
        .skip(Number(desde)),
        //.limit(Number(limite)),
    ]);

    res.json({ Ok: true, total: total, resp: productos });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};


const obtenerProducto = async (req, res = response) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id)
      .populate("usuario", "nombre")
      .populate("IdCategoria", "nombre")
      .populate("IdProveedorMarca", "descripcion")
      ;

    res.json({ Ok: true, resp: producto });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};

const obtenerProductosCategoria = async (req, res = response) => {
  const { id } = req.params;
  const { limite = 5, desde = 0 } = req.query;
  const query = { IdCategoria: id, estado: true };

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .populate("usuario", "nombre")
        .populate({ path: 'IdCategoria', select: 'nombre estado' })
        .populate("IdProveedorMarca", "descripcion")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({ Ok: true, total: total, resp: productos });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};


const obtenerProductosProveedorMarca = async (req, res = response) => {
  const { id } = req.params;
  const { limite = 5, desde = 0 } = req.query;
  const query = { IdProveedorMarca: id, estado: true };

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .populate("usuario", "nombre")
        .populate("IdCategoria", "nombre")
        .populate("IdProveedorMarca", "descripcion")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({ Ok: true, total: total, resp: productos });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};



const crearProducto = async (req, res = response) => {
  const { estado, usuario, ...body } = req.body;

  try {
    const productoDB = await Producto.findOne({ sku: body.sku });

    if (productoDB) {
      return res.status(400).json({
        msg: `El SKU del producto ${body.sku}, ya existe`,
      });
    }

    // Generar la data a guardar
    const data = {
      ...body,
      nombre: body.nombre.toUpperCase(),
      usuario: req.usuario._id,
    };

    const producto = new Producto(data);

    // Guardar DB
    await producto.save();

    res.status(201).json({ Ok: true, resp: producto });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};

const actualizarProducto = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  try {
    if (data.sku) {
      //Verifica que la URL existe
      const productoDB = await Producto.findOne({ sku: data.sku });

      if (productoDB) {
        return res.status(400).json({
          msg: `El SKU del Producto ${data.sku}, ya existe`,
        });
      }
    }

    if (data.nombre) {
      data.nombre = data.nombre.toUpperCase();
    }

    //Aqui Valida la Categoria
    if (data.IdCategoria) {
      if (isValidObjectId(data.IdCategoria)) {
        const existeCategoria = await Categoria.findById(data.IdCategoria);

        if (!existeCategoria) {
          return res.status(400).json({
            Ok: false,
            resp: `El Id de la Categoria ${data.IdCategoria}, no existe`,
          });
        }
      } else {
        return res.status(400).json({
          Ok: false,
          resp: `El Id de la Categoria ${data.IdCategoria}, no es un MongoBDId`,
        });
      }
    }

    //Aqui Valida la ProveedorMarca
    if (data.IdProveedorMarca) {
      if (isValidObjectId(data.IdProveedorMarca)) {
        const existeProveedorMarca = await ProveedorMarca.findById(data.IdProveedorMarca);

        if (!existeProveedorMarca) {
          return res.status(400).json({
            Ok: false,
            resp: `El Id del ProveedorMarca ${data.IdProveedorMarca}, no existe`,
          });
        }
      } else {
        return res.status(400).json({
          Ok: false,
          resp: `El Id del ProveedorMarca ${data.IdProveedorMarca}, no es un MongoBDId`,
        });
      }
    }



    data.usuario = req.usuario._id;
    data.fecha_actualizacion = now();

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

    res.json({ Ok: true, resp: producto });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};

const borrarProducto = async (req, res = response) => {
  const { id } = req.params;

  try {
    const productoBorrado = await Producto.findByIdAndUpdate(
      id,
      { estado: false, fecha_actualizacion: now() },
      { new: true }
    );

    res.json({ Ok: true, resp: productoBorrado });
  } catch (error) {
    res.json({ Ok: false, resp: error });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto,
  obtenerProductosCategoria,
  obtenerProductosProveedorMarca
};
