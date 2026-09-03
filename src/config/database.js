const { MongoClient } = require('mongodb');
require('dotenv').config();

// Creamos la instancia del cliente con la URI del archivo .env
const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function conectarDB() {
    if (db) return db;

    try {
        await client.connect();

        db = client.db(process.env.MONGODB_DATABASE);

        console.log(' Conectado exitosamente a MongoDB');

        return db;

    } catch (error) {

        console.error(
            ' Error al conectar a MongoDB:',
            error
        );

        process.exit(1);
    }
}

// Exportamos la función y el cliente
module.exports = {
    conectarDB,
    client
};



