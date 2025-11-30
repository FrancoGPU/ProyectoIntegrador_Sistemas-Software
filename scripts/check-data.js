const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("logistockdb");
    
    const counts = {
      proveedores: await db.collection('proveedores').countDocuments(),
      rutas: await db.collection('rutas').countDocuments(),
      clientes: await db.collection('clientes').countDocuments(),
      products: await db.collection('products').countDocuments()
    };
    
    console.log("Conteo de documentos:", counts);
    
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
