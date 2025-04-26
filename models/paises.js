    const { Schema, model} = require('mongoose');

    const PaisSchema = Schema({
        nombre:{
            type: String,
            required: [true, 'El nombre es obligatorio']
        },
        continente:{
            type: String,
            required: [true, 'El continente  es obligatorio']
        }
    });


    //Quita los campos que no quiero ver.
    PaisSchema.methods.toJSON = function () {
        const { __v, _id, ...pais } = this.toObject();
        pais.uid = _id;
        return pais;
    };

    module.exports = model('Pais', PaisSchema);