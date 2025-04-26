const { Schema, model } = require('mongoose');
const { INTEGER } = require('sequelize');

const ContratacionesSchema = Schema({
    IdJugador: {
        type: Schema.Types.ObjectId,
        ref: 'Jugadores',
        required: true
    },
    IdEquipo: {
        type: Schema.Types.ObjectId,
        ref: 'Equipos',
        required: true
    },
    fecha_contratacion: {
        type: Date,
        default: Date.now,
        required: 'Debe tener una fecha de contratacion '
    },
    monto_contratacion: {
        type: INTEGER,
        required: 'Debe de tener un monto de contratacion'
    }

});


ContratacionesSchema.methods.toJSON = function() {
    const { __v, ...data  } = this.toObject();
    return data;
}

module.exports = model( 'Contrataciones', ContratacionesSchema );


/*BrandProviderProduct
id	1		NO	int	10	0	
sku	2	''	NO	varchar			
product	3	''	NO	varchar			
characteristics	4	''	NO	text			
linkVideo	5	''	NO	varchar			
conditions	6	''	NO	text			
featured	7	0	NO	tinyint	3	0	Campo que indica si el producto es destacado
brandProviderId	8		NO	int	10	0	
subcategoryId	9		NO	int	10	0	
warrantyId	10		NO	int	10	0	
optionsStatus	11	'active'	NO	enum			
optionsCreatedat	12	current_timestamp(6)	NO	datetime			
optionsUpdatedat	13	current_timestamp(6)	NO	datetime			
long	14	0	NO	double	22		Largo del producto
high	15	0	NO	double	22		Alto del producto
wide	16	0	NO	double	22		Ancho del producto
weight	17	0	NO	double	22		Peso del producto
volume	18	0	NO	double	22		Volumen del producto
applyDevolution	19	'notApply'	NO	enum			Aplica o no devolución
service	20	0	NO	tinyint	3	0	Campo que indica si es un producto o servicio
*/