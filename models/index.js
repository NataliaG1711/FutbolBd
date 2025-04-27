const Server = require('./server');
const Usuario = require('./mongoUsuario.model');
const Heroe = require('./mongoHeroe.model');
const Futbolistas = require('./futbolistas')
const Equipos= require('./equipos')
const Paises = require('./paises');
const Contrataciones = require('./contrataciones');

module.exports = {
    Server,
    Usuario,
    Heroe,
    Futbolistas,
    Equipos,
    Paises,
    Contrataciones
}