const { MongoClient, Decimal128 } = require('mongodb');

const uri = "mongodb://localhost:27017";
const dbName = "logistockdb";

async function run() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("🚀 Conectado a MongoDB...");
        const db = client.db(dbName);

        // ================================================
        // 1. PROVEEDORES
        // ================================================
        console.log("📦 Insertando Proveedores...");
        const proveedoresCollection = db.collection('proveedores');
        await proveedoresCollection.deleteMany({}); // Limpiar antes de insertar si se desea, o usar insertMany directamente
        
        const proveedores = [
            {
                nombre: "Juan Pérez",
                empresa: "TechSupply SA",
                email: "contacto@techsupply.com",
                telefono: "+51 987654321",
                direccion: "Av. Tecnología 123, Lima",
                tipo: "Nacional",
                rucNit: "20123456789",
                pais: "Perú",
                ciudad: "Lima",
                diasPago: 30,
                descuentoGeneral: Decimal128.fromString("5.0"),
                categoriasProductos: ["Tecnología", "Oficina"],
                isActive: true,
                totalOrdenes: 15,
                montoTotalCompras: Decimal128.fromString("75000.00"),
                contactoComercial: {
                    nombre: "María González",
                    cargo: "Gerente de Ventas",
                    telefono: "+51 987654322",
                    email: "maria@techsupply.com"
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Proveedor"
            },
            {
                nombre: "Carlos Mendoza",
                empresa: "OfficeMax Peru",
                email: "ventas@officemax.pe",
                telefono: "+51 912345678",
                direccion: "Jr. Comercio 456, Lima",
                tipo: "Internacional",
                rucNit: "20987654321",
                pais: "Perú",
                ciudad: "Lima",
                diasPago: 45,
                descuentoGeneral: Decimal128.fromString("7.5"),
                categoriasProductos: ["Oficina", "Consumo"],
                isActive: true,
                totalOrdenes: 23,
                montoTotalCompras: Decimal128.fromString("120000.00"),
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Proveedor"
            },
            {
                nombre: "Ana Torres",
                empresa: "Distribuidora Industrial Norte",
                email: "contacto@industrialnorte.com",
                telefono: "+51 923456789",
                direccion: "Av. Industrial 789, Trujillo",
                tipo: "Regional",
                rucNit: "20456789012",
                pais: "Perú",
                ciudad: "Trujillo",
                diasPago: 30,
                descuentoGeneral: Decimal128.fromString("10.0"),
                categoriasProductos: ["Industrial", "Tecnología"],
                isActive: true,
                totalOrdenes: 8,
                montoTotalCompras: Decimal128.fromString("45000.00"),
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Proveedor"
            },
            {
                nombre: "Roberto Silva",
                empresa: "Materiales del Centro",
                email: "info@materialescentro.com",
                telefono: "+51 934567890",
                direccion: "Calle Principal 321, Cusco",
                tipo: "Local",
                rucNit: "20789012345",
                pais: "Perú",
                ciudad: "Cusco",
                diasPago: 15,
                descuentoGeneral: Decimal128.fromString("3.0"),
                categoriasProductos: ["Consumo", "Oficina"],
                isActive: true,
                totalOrdenes: 12,
                montoTotalCompras: Decimal128.fromString("28000.00"),
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Proveedor"
            },
            {
                nombre: "Patricia Vargas",
                empresa: "GlobalTech Solutions",
                email: "sales@globaltech.com",
                telefono: "+1 555-1234567",
                direccion: "Tech Park 100, Miami, FL",
                tipo: "Internacional",
                rucNit: "INT987654321",
                pais: "Estados Unidos",
                ciudad: "Miami",
                diasPago: 60,
                descuentoGeneral: Decimal128.fromString("12.0"),
                categoriasProductos: ["Tecnología"],
                isActive: true,
                totalOrdenes: 5,
                montoTotalCompras: Decimal128.fromString("150000.00"),
                ultimaOrden: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Proveedor"
            }
        ];
        await proveedoresCollection.insertMany(proveedores);
        console.log("✅ Proveedores insertados");

        // ================================================
        // 2. RUTAS
        // ================================================
        console.log("🚗 Insertando Rutas...");
        const rutasCollection = db.collection('rutas');
        await rutasCollection.deleteMany({});

        const rutas = [
            {
                codigo: "RUTA-001",
                nombre: "Lima Centro a Callao",
                descripcion: "Ruta urgente de distribución al puerto",
                origen: "Av. Arequipa 1234, Lima Centro",
                destino: "Puerto del Callao, Av. Contralmirante Mora",
                paradas: [
                    {
                        direccion: "Av. Venezuela 500, Lima",
                        cliente: "Almacén Central",
                        tiempoEstimadoMinutos: 15,
                        notas: "Descarga en muelle 2",
                        completada: false
                    }
                ],
                distanciaKm: Decimal128.fromString("15.5"),
                tiempoEstimadoMinutos: 45,
                estado: "En Proceso",
                prioridad: "Urgente",
                vehiculoAsignado: "Camión Mercedes-Benz Actros",
                conductorAsignado: "José Ramírez",
                costoCombustible: Decimal128.fromString("85.50"),
                costoPeajes: Decimal128.fromString("12.00"),
                otrosCostos: Decimal128.fromString("5.00"),
                fechaPlanificada: new Date(Date.now() + 86400000),
                fechaInicio: new Date(),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Ruta"
            },
            {
                codigo: "RUTA-002",
                nombre: "Lima a Arequipa",
                descripcion: "Ruta interprovincial de carga completa",
                origen: "Lima, Av. Colonial 2500",
                destino: "Arequipa, Parque Industrial",
                paradas: [
                    {
                        direccion: "Ica, Terminal Terrestre",
                        cliente: "Distribuidora Ica SAC",
                        tiempoEstimadoMinutos: 30,
                        notas: "Entrega parcial",
                        completada: false
                    },
                    {
                        direccion: "Nazca, Av. Los Incas 100",
                        cliente: "Comercial Nazca",
                        tiempoEstimadoMinutos: 20,
                        completada: false
                    }
                ],
                distanciaKm: Decimal128.fromString("1010.0"),
                tiempoEstimadoMinutos: 720,
                estado: "Planificada",
                prioridad: "Alta",
                vehiculoAsignado: "Trailer Volvo FH16",
                conductorAsignado: "Miguel Sánchez",
                costoCombustible: Decimal128.fromString("850.00"),
                costoPeajes: Decimal128.fromString("180.00"),
                otrosCostos: Decimal128.fromString("120.00"),
                fechaPlanificada: new Date(Date.now() + 172800000),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Ruta"
            },
            {
                codigo: "RUTA-003",
                nombre: "Lima a Trujillo",
                descripcion: "Distribución rápida costa norte",
                origen: "Lima, Ate Vitarte",
                destino: "Trujillo, Av. España 1200",
                distanciaKm: Decimal128.fromString("560.0"),
                tiempoEstimadoMinutos: 480,
                estado: "Completada",
                prioridad: "Media",
                vehiculoAsignado: "Camión Hino 500",
                conductorAsignado: "Luis Fernández",
                costoCombustible: Decimal128.fromString("420.00"),
                costoPeajes: Decimal128.fromString("95.00"),
                otrosCostos: Decimal128.fromString("50.00"),
                fechaPlanificada: new Date(Date.now() - 86400000),
                fechaInicio: new Date(Date.now() - 86400000),
                fechaFinalizacion: new Date(Date.now() - 3600000),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Ruta"
            },
            {
                codigo: "RUTA-004",
                nombre: "Lima Sur a Lima Norte",
                descripcion: "Ruta local de distribución urbana",
                origen: "Villa El Salvador, Av. Pachacutec",
                destino: "Los Olivos, Av. Naranjal",
                paradas: [
                    {
                        direccion: "San Juan de Miraflores, Av. Los Héroes",
                        cliente: "MegaPlaza",
                        tiempoEstimadoMinutos: 20,
                        completada: false
                    },
                    {
                        direccion: "Cercado de Lima, Jr. Huánuco",
                        cliente: "Mercado Central",
                        tiempoEstimadoMinutos: 25,
                        completada: false
                    }
                ],
                distanciaKm: Decimal128.fromString("35.0"),
                tiempoEstimadoMinutos: 90,
                estado: "Planificada",
                prioridad: "Baja",
                vehiculoAsignado: "Furgón Toyota Hiace",
                conductorAsignado: "Carlos Huamán",
                costoCombustible: Decimal128.fromString("45.00"),
                costoPeajes: Decimal128.fromString("8.00"),
                otrosCostos: Decimal128.fromString("10.00"),
                fechaPlanificada: new Date(Date.now() + 259200000),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Ruta"
            },
            {
                codigo: "RUTA-005",
                nombre: "Lima a Cusco",
                descripcion: "Ruta turística con carga especial",
                origen: "Lima, Aeropuerto Jorge Chávez",
                destino: "Cusco, Aeropuerto Velasco Astete",
                distanciaKm: Decimal128.fromString("1105.0"),
                tiempoEstimadoMinutos: 840,
                estado: "Suspendida",
                prioridad: "Alta",
                vehiculoAsignado: "Camión Scania R450",
                conductorAsignado: "Pedro Quispe",
                costoCombustible: Decimal128.fromString("950.00"),
                costoPeajes: Decimal128.fromString("200.00"),
                otrosCostos: Decimal128.fromString("150.00"),
                fechaPlanificada: new Date(Date.now() + 432000000),
                isActive: true,
                observaciones: "Suspendida temporalmente por condiciones climáticas en la sierra",
                createdAt: new Date(),
                updatedAt: new Date(),
                _class: "com.logistock.model.Ruta"
            }
        ];
        await rutasCollection.insertMany(rutas);
        console.log("✅ Rutas insertadas");

        // ================================================
        // 3. CLIENTES
        // ================================================
        console.log("👥 Insertando Clientes adicionales...");
        const clientesCollection = db.collection('clientes');
        await clientesCollection.deleteMany({});

        const clientes = [
            {
                nombre: "María Rodríguez",
                empresa: "Comercial Santa Rosa SAC",
                email: "maria.rodriguez@santarosa.com",
                telefono: "+51 945678901",
                direccion: "Jr. Santa Rosa 234, Lima",
                categoria: "Premium",
                fechaRegistro: new Date(Date.now() - 15552000000),
                ultimaCompra: new Date(Date.now() - 864000000),
                totalCompras: Decimal128.fromString("45000.00"),
                isActive: true,
                notas: "Cliente preferencial con descuentos especiales",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nombre: "Jorge Castillo",
                empresa: "Distribuidora El Sol EIRL",
                email: "jorge@elsol.com",
                telefono: "+51 956789012",
                direccion: "Av. El Sol 567, Arequipa",
                categoria: "Corporativo",
                fechaRegistro: new Date(Date.now() - 31104000000),
                ultimaCompra: new Date(Date.now() - 2592000000),
                totalCompras: Decimal128.fromString("120000.00"),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nombre: "Lucía Mendoza",
                empresa: "Inversiones Norte SAC",
                email: "lucia@inversionesnorte.com",
                telefono: "+51 967890123",
                direccion: "Calle Comercio 890, Trujillo",
                categoria: "Regular",
                fechaRegistro: new Date(Date.now() - 7776000000),
                ultimaCompra: new Date(Date.now() - 1296000000),
                totalCompras: Decimal128.fromString("28500.00"),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        await clientesCollection.insertMany(clientes);
        console.log("✅ Clientes insertados");

        console.log("================================================");
        console.log("✅ Datos de prueba insertados exitosamente");
        console.log("================================================");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
