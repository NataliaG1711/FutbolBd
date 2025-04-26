const { Schema, model } = require('mongoose');

const EquiposSchema = Schema({
    nombre_equipo: {
        type: String,
        required: true
    },
    ciudad: {
        type: String,
        required: true
    },
    pais: {
        type: Schema.Types.ObjectId,
        ref: 'Paises',
        required: true
    },
    estadio: {
        type: String,
        required: true
    }

});


EquiposSchema.methods.toJSON = function() {
    const { __v, ...data  } = this.toObject();
    return data;
}

module.exports = model( 'Equipos', EquiposSchema );