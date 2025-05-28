require('dotenv').config();
const neo4j = require('neo4j-driver');


const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);




const dbConnectionNeo4j = async () => {
    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
    const URI = process.env.NEO4J_URI
    const USER = process.env.NEO4J_USER
    const PASSWORD = process.env.NEO4J_PASSWORD


    let driver


    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))


    /*
    const session = driver.session();
    try {
        const result = await session.run('RETURN "Connection successful!" AS message');
        console.log(result.records[0].get('message'));
    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
    */    


   
    try {


        const serverInfo = await driver.getServerInfo()
        console.log('Connection established')
        console.log(serverInfo)
    } catch (err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`)
        console.log(err);
    }
   
};




module.exports = {
    dbConnectionNeo4j,
    driver
}