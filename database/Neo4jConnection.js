require('dotenv').config();
const neo4j = require('neo4j-driver');

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

const dbConnectionNeo4j = async () => {
    try {
        const serverInfo = await driver.getServerInfo();
        console.log('Conexión a Neo4j establecida');
        console.log('Info del servidor:', serverInfo);
    } catch (err) {
        console.error('Error de conexión a Neo4j');
        console.error(`${err.message}`);
        console.error(`Código: ${err.code}`);
        console.error(`Descripción: ${err.gqlStatusDescription}`);
    }
};

module.exports = {
    dbConnectionNeo4j,
    driver
};
