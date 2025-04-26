const { Schema, model, models } = require('mongoose');

const HeroeSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    bio: {
        type: String,
        required: [true, 'La biografía es obligatoria']
    },
    img: {
        type: String
    },
    aparicion: {
        type: String,
        required: [true, 'La fecha de aparición es obligatoria']
    },
    casa: {
        type: String,
        required: [true, 'La casa es obligatoria'],
        enum: ['Marvel', 'DC']
    },
    estado: {
        type: Boolean,
        default: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now,
        required: 'Debe tener una fecha de creación.'
    },
    fecha_actualizacion: {
        type: Date
    }
});

HeroeSchema.methods.toJSON = function () {
    const { __v, _id, ...heroe } = this.toObject();
    heroe.uid = _id;
    return heroe;
}

module.exports = models.Heroe || model('Heroe', HeroeSchema);
