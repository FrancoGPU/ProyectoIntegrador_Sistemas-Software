const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("logistockdb");
    
    console.log("🗑️  Eliminando base de datos 'logistockdb'...");
    await db.dropDatabase();
    console.log("✅ Base de datos eliminada correctamente.");
    
  } catch (e) {
    console.error("❌ Error al limpiar:", e);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
