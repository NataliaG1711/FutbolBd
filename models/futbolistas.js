const { Schema, model } = require('mongoose');

const FutbolistaSchema = Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios']
  },
  edad: {
    type: Number,
    required: [true, 'La edad es obligatoria']
  },
  internacional: {
    type: Boolean,
    default: true
  },
  fecha_nacimiento: {
    type: Date,
    required: [true, 'Debe tener una fecha de nacimiento.']
  },
  pais_nacimiento: {
    type: Schema.Types.ObjectId,
    ref: 'Pais',
    required: [true, 'El país es obligatorio']
  },
  equipo_actual: {
    type: Schema.Types.ObjectId,
    ref: 'Equipo',
    required: [true, 'El equipo actual es obligatorio']
  },
  equipos_anteriores: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Equipo' }],
    default: [],
    validate: [arr => Array.isArray(arr), 'Equipos anteriores debe ser un arreglo']
  }
});

// Quita los campos que no quiero ver.
FutbolistaSchema.methods.toJSON = function () {
  const { __v, _id, ...futbolista } = this.toObject();
  futbolista.uid = _id;
  return futbolista;
};

module.exports = model('Futbolista', FutbolistaSchema);
