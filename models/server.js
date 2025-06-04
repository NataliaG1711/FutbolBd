const express = require('express')
const cors = require('cors')


const {dbConnectionNeo4j} = require('../database/Neo4jConnection')


class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.pathsNeo = {
            //Ajusto la url para la outorizacion por login
            usuarios: '/api/usuariosNeo',
            personas: '/api/personasNeo',
            famosos: '/api/famososNeo',
            paises: '/api/paisesNeo',
            ciudades: '/api/ciudadesNeo',
            platos: '/api/platosNeo',
            sitios: '/api/sitiosNeo',
            menu: '/api/menuNeo',
            tags: '/api/tagsNeo',
            authNeo: '/api/authNeo',
            visitas: '/api/visitasNeo',
            
            //usuarios: '/api/usuarios',
            //heroes:'/api/heroes',            
            //multimedias:'/api/multimedias',
            //multimediasheroe:'/api/multimediasheroe',
            //grupomultimedias:'/api/grupomultimedias',


        }



        /*
        this.app.get('/', function (req, res) {
            res.send('Hola Mundo a todos... como estan...')
        })
        */    
    

        //Aqui me conecto a Neo
        this.conectarNeo4j();


        //Middlewares
        this.middlewares();


        //Routes
        this.routes();

    }


    async conectarNeo4j(){
        await dbConnectionNeo4j();
    }

    
    routes() {

        //Neo4j
        this.app.use(this.pathsNeo.personas, require('../routes/personasNeo.route'))
        this.app.use(this.pathsNeo.paises, require('../routes/paisesNeo.route'))
        this.app.use(this.pathsNeo.ciudades, require('../routes/ciudadesNeo.route'))
        this.app.use(this.pathsNeo.sitios, require('../routes/sitiosNeo.route'))
        this.app.use(this.pathsNeo.platos, require('../routes/platosNeo.route'))
        this.app.use(this.pathsNeo.menu, require('../routes/menuNeo.route'))
        //this.app.use(this.pathsNeo.tags, require('../routes/tagsNeo.route'))
        this.app.use(this.pathsNeo.usuarios, require('../routes/usuariosNeo.route'));
        this.app.use(this.pathsNeo.authNeo, require('../routes/authNeo.route'))
        this.app.use(this.pathsNeo.famosos, require('../routes/famososNeo.route'));
        this.app.use(this.pathsNeo.visitas, require('../routes/visitasNeo.route'));
        this.app.use(this.pathsNeo.tags, require('../routes/tagsNeo.route'))
    }
    


    
    middlewares() {
        //CORS
        //Evitar errores por Cors Domain Access
        //Usado para evitar errores.
        this.app.use(cors());

        //Lectura y Parseo del body
        //JSON        
        //JSON (JavaScript Object Notation)
        //es un formato ligero de intercambio de datos.
        //JSON es de fácil lectura y escritura para los usuarios.
        //JSON es fácil de analizar y generar por parte de las máquinas.
        //JSON se basa en un subconjunto del lenguaje de programación JavaScript,
        //Estándar ECMA-262 3a Edición - Diciembre de 1999.
        this.app.use(express.json());


        //Directorio publico
        this.app.use(express.static('public'));


    }
    


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }


}


module.exports = Server;
