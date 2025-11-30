const { MongoClient } = require('mongodb');

// Cadena de conexión usando el nombre del servicio 'mongodb' y credenciales
const uri = "mongodb://admin:password123@mongodb:27017/?authSource=admin";

async function run() {
    console.log("Probando conexión autenticada a: " + uri);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    
    try {
        await client.connect();
        console.log("✅ ¡Conexión y Autenticación Exitosas!");
        
        const db = client.db("logistockdb");
        const count = await db.collection('products').countDocuments();
        console.log(`📊 Acceso a datos verificado. Productos: ${count}`);
        
    } catch (e) {
        console.error("❌ Error de conexión:", e.message);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
