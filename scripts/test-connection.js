const { MongoClient } = require('mongodb');

// Intentar conectar al servicio 'mongodb' (nombre del contenedor en docker-compose)
// O a localhost si está mapeado.
const uri = "mongodb://mongodb:27017"; 
// Nota: En devcontainers a veces es localhost si comparten red, o el nombre del servicio.
// Probaremos 'mongodb' primero ya que es el nombre del servicio.

async function checkConnection() {
    console.log("Probando conexión a: " + uri);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    try {
        await client.connect();
        console.log("✅ Conexión exitosa a MongoDB en el puerto 27017");
        const db = client.db("logistockdb");
        const count = await db.collection('products').countDocuments();
        console.log(`📊 Productos encontrados: ${count}`);
    } catch (e) {
        console.log("❌ Falló conexión a 'mongodb': " + e.message);
        // Intentar localhost
        console.log("Probando localhost...");
        const client2 = new MongoClient("mongodb://localhost:27017", { serverSelectionTimeoutMS: 2000 });
        try {
            await client2.connect();
            console.log("✅ Conexión exitosa a localhost:27017");
        } catch (e2) {
            console.log("❌ Falló conexión a localhost: " + e2.message);
        } finally {
            await client2.close();
        }
    } finally {
        await client.close();
    }
}

checkConnection();
