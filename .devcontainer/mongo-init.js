// Inicialización de MongoDB para LogiStock Solutions
db = db.getSiblingDB('logistockdb');

// Crear colecciones con datos iniciales
db.products.insertMany([
  {
    code: 'ASU001',
    name: 'Ordenador ASUS',
    description: 'Ordenador de alto rendimiento para oficina',
    category: 'Tecnología',
    stock: 25,
    minStock: 10,
    price: 3500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: 'OFF001',
    name: 'Silla Ergonómica',
    description: 'Silla de oficina con soporte lumbar',
    category: 'Oficina',
    stock: 8,
    minStock: 15,
    price: 450,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: 'TEC001',
    name: 'Monitor LED 24"',
    description: 'Monitor LED Full HD para computadora',
    category: 'Tecnología',
    stock: 32,
    minStock: 12,
    price: 850,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: 'IND001',
    name: 'Estantería Metálica',
    description: 'Estantería industrial para almacén',
    category: 'Industrial',
    stock: 5,
    minStock: 8,
    price: 1200,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.clientes.insertMany([
  {
    nombre: 'Juan Pérez',
    empresa: 'Corporación ABC',
    email: 'juan@abc.com',
    telefono: '987654321',
    direccion: 'Av. Principal 123',
    categoria: 'Premium',
    fechaRegistro: new Date(),
    ultimaCompra: new Date()
  },
  {
    nombre: 'María García',
    empresa: 'Industrias XYZ',
    email: 'maria@xyz.com',
    telefono: '987654322',  
    direccion: 'Jr. Comercio 456',
    categoria: 'Corporativo',
    fechaRegistro: new Date(),
    ultimaCompra: new Date()
  }
]);

db.rutas.insertMany([
  {
    nombre: 'Ruta Centro Norte',
    conductor: 'Carlos Mendoza',
    origen: 'Almacén Central - Lima',
    destino: 'Distrito San Martín de Porres',
    distancia: 15.2,
    tiempoEstimado: 1.5,
    estado: 'En Tránsito',
    prioridad: 'Alta',
    eficiencia: 92,
    fechaCreacion: new Date()
  },
  {
    nombre: 'Ruta Este Industrial',
    conductor: 'Ana Rodríguez',
    origen: 'Almacén Central - Lima',
    destino: 'Zona Industrial Ate',
    distancia: 18.7,
    tiempoEstimado: 2.2,
    estado: 'Planificada',
    prioridad: 'Media',
    eficiencia: 88,
    fechaCreacion: new Date()
  }
]);

print('🚚 Base de datos LogiStock Solutions inicializada exitosamente!');