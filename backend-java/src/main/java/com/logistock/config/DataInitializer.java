package com.logistock.config;

import com.logistock.model.*;
import com.logistock.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Inicializador de datos para crear usuarios y datos de prueba por defecto
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private RutaRepository rutaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // cleanDatabase(); // Comentado para mantener persistencia de datos
        initializeUsers();
        initializeProveedores();
        initializeRutas();
        initializeClientes();
        initializeProducts();
        
        // Generar datos masivos adicionales solo si no existen
        generateMassiveData();
    }

    private void generateMassiveData() {
        // Si ya tenemos una cantidad considerable de productos, asumimos que ya se cargaron los datos masivos
        if (productRepository.count() > 10) {
            logger.info("✓ Datos masivos ya existen, omitiendo generación");
            return;
        }

        logger.info("🚀 Generando datos masivos adicionales...");
        try {
            // Generar 45 productos adicionales
            for (int i = 6; i <= 50; i++) {
                Product p = new Product();
                p.setCode("PROD-" + String.format("%03d", i));
                p.setName("Producto Genérico " + i);
                p.setDescription("Descripción del producto genérico " + i);
                p.setCategory(i % 2 == 0 ? "Tecnología" : "Oficina");
                p.setStock((int) (Math.random() * 100) + 1);
                p.setMinStock(5);
                p.setPrice(new BigDecimal((Math.random() * 500) + 50));
                p.setSupplier(i % 2 == 0 ? "TechSupply SA" : "OfficeMax Peru");
                p.setLocation("Almacén " + (char)('A' + (i % 3)) + "-" + i);
                productRepository.save(p);
            }
            
            // Generar 17 clientes adicionales
            for (int i = 4; i <= 20; i++) {
                Cliente c = new Cliente();
                c.setNombre("Cliente Extra " + i);
                c.setEmpresa("Empresa Cliente " + i + " SAC");
                c.setEmail("cliente" + i + "@empresa.com");
                c.setTelefono("+51 9000000" + String.format("%02d", i));
                c.setDireccion("Av. Principal " + i * 100 + ", Lima");
                c.setCategoria(i % 3 == 0 ? "Premium" : "Regular");
                c.setTotalCompras(new BigDecimal((Math.random() * 10000) + 1000));
                clienteRepository.save(c);
            }

            // Generar 7 rutas adicionales
            for (int i = 4; i <= 10; i++) {
                Ruta r = Ruta.builder()
                    .codigo("RUTA-" + String.format("%03d", i))
                    .nombre("Ruta Extra " + i)
                    .descripcion("Ruta generada automáticamente " + i)
                    .origen("Origen " + i)
                    .destino("Destino " + i)
                    .distanciaKm(new BigDecimal((Math.random() * 500) + 50))
                    .tiempoEstimadoMinutos((int) (Math.random() * 300) + 60)
                    .estado(i % 2 == 0 ? "En Proceso" : "Planificada")
                    .prioridad(i % 3 == 0 ? "Alta" : "Media")
                    .vehiculoAsignado("Vehículo " + i)
                    .conductorAsignado("Conductor " + i)
                    .isActive(true)
                    .build();
                rutaRepository.save(r);
            }
            
            logger.info("✅ Datos masivos generados exitosamente");
        } catch (Exception e) {
            logger.error("Error generando datos masivos: " + e.getMessage());
        }
    }

    private void cleanDatabase() {
        logger.info("🧹 Limpiando base de datos completa...");
        try {
            productRepository.deleteAll();
            clienteRepository.deleteAll();
            rutaRepository.deleteAll();
            proveedorRepository.deleteAll();
            // No borramos usuarios para no perder acceso admin, o sí? 
            // El usuario dijo "Limpia todo". Pero initializeUsers los recrea.
            // Vamos a borrar usuarios también para ser consistentes con "todo".
            userRepository.deleteAll();
            logger.info("✅ Base de datos limpiada correctamente");
        } catch (Exception e) {
            logger.error("Error al limpiar base de datos: " + e.getMessage());
        }
    }

    /**
     * Crear usuarios por defecto si no existen
     */
    private void initializeUsers() {
        try {
            // Crear usuario admin si no existe
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@logistock.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                
                userRepository.save(admin);
                logger.info("✓ Usuario ADMIN creado exitosamente");
            }

            // Crear usuario normal si no existe
            if (!userRepository.existsByUsername("usuario")) {
                User user = new User();
                user.setUsername("usuario");
                user.setEmail("usuario@logistock.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole("USER");
                user.setEnabled(true);
                
                userRepository.save(user);
                logger.info("✓ Usuario USER creado exitosamente");
            }

        } catch (Exception e) {
            logger.error("Error al inicializar usuarios: " + e.getMessage(), e);
        }
    }

    private void initializeProveedores() {
        if (proveedorRepository.count() > 0) {
            logger.info("✓ Proveedores ya existen, omitiendo carga inicial");
            return;
        }

        try {
            List<Proveedor> proveedores = Arrays.asList(
                Proveedor.builder()
                    .nombre("Juan Pérez")
                    .empresa("TechSupply SA")
                    .email("contacto@techsupply.com")
                    .telefono("+51 987654321")
                    .direccion("Av. Tecnología 123, Lima")
                    .tipo("Nacional")
                    .rucNit("20123456789")
                    .pais("Perú")
                    .ciudad("Lima")
                    .diasPago(30)
                    .descuentoGeneral(new BigDecimal("5.0"))
                    .categoriasProductos(Arrays.asList("Tecnología", "Oficina"))
                    .isActive(true)
                    .totalOrdenes(15)
                    .montoTotalCompras(new BigDecimal("75000.00"))
                    .contactoComercial(new Proveedor.ContactoComercial("María González", "Gerente de Ventas", "+51 987654322", "maria@techsupply.com"))
                    .build(),
                
                Proveedor.builder()
                    .nombre("Carlos Mendoza")
                    .empresa("OfficeMax Peru")
                    .email("ventas@officemax.pe")
                    .telefono("+51 912345678")
                    .direccion("Jr. Comercio 456, Lima")
                    .tipo("Internacional")
                    .rucNit("20987654321")
                    .pais("Perú")
                    .ciudad("Lima")
                    .diasPago(45)
                    .descuentoGeneral(new BigDecimal("7.5"))
                    .categoriasProductos(Arrays.asList("Oficina", "Consumo"))
                    .isActive(true)
                    .totalOrdenes(23)
                    .montoTotalCompras(new BigDecimal("120000.00"))
                    .build(),

                Proveedor.builder()
                    .nombre("Ana Torres")
                    .empresa("Distribuidora Industrial Norte")
                    .email("contacto@industrialnorte.com")
                    .telefono("+51 923456789")
                    .direccion("Av. Industrial 789, Trujillo")
                    .tipo("Regional")
                    .rucNit("20456789012")
                    .pais("Perú")
                    .ciudad("Trujillo")
                    .diasPago(30)
                    .descuentoGeneral(new BigDecimal("10.0"))
                    .categoriasProductos(Arrays.asList("Industrial", "Tecnología"))
                    .isActive(true)
                    .totalOrdenes(8)
                    .montoTotalCompras(new BigDecimal("45000.00"))
                    .build()
            );

            proveedorRepository.saveAll(proveedores);
            logger.info("✓ Proveedores iniciales cargados exitosamente");

        } catch (Exception e) {
            logger.error("Error al inicializar proveedores: " + e.getMessage(), e);
        }
    }

    private void initializeRutas() {
        if (rutaRepository.count() > 0) {
            logger.info("✓ Rutas ya existen, omitiendo carga inicial");
            return;
        }

        try {
            List<Ruta> rutas = Arrays.asList(
                Ruta.builder()
                    .codigo("RUTA-001")
                    .nombre("Lima Centro a Callao")
                    .descripcion("Ruta urgente de distribución al puerto")
                    .origen("Av. Arequipa 1234, Lima Centro")
                    .destino("Puerto del Callao, Av. Contralmirante Mora")
                    .paradas(Arrays.asList(
                        Ruta.Parada.builder()
                            .direccion("Av. Venezuela 500, Lima")
                            .cliente("Almacén Central")
                            .tiempoEstimadoMinutos(15)
                            .notas("Descarga en muelle 2")
                            .completada(false)
                            .build()
                    ))
                    .distanciaKm(new BigDecimal("15.5"))
                    .tiempoEstimadoMinutos(45)
                    .estado("En Proceso")
                    .prioridad("Urgente")
                    .vehiculoAsignado("Camión Mercedes-Benz Actros")
                    .conductorAsignado("José Ramírez")
                    .costoCombustible(new BigDecimal("85.50"))
                    .costoPeajes(new BigDecimal("12.00"))
                    .otrosCostos(new BigDecimal("5.00"))
                    .fechaPlanificada(LocalDateTime.now().plusDays(1))
                    .fechaInicio(LocalDateTime.now())
                    .isActive(true)
                    .build(),

                Ruta.builder()
                    .codigo("RUTA-002")
                    .nombre("Lima a Arequipa")
                    .descripcion("Ruta interprovincial de carga completa")
                    .origen("Lima, Av. Colonial 2500")
                    .destino("Arequipa, Parque Industrial")
                    .paradas(Arrays.asList(
                        Ruta.Parada.builder()
                            .direccion("Ica, Terminal Terrestre")
                            .cliente("Distribuidora Ica SAC")
                            .tiempoEstimadoMinutos(30)
                            .notas("Entrega parcial")
                            .completada(false)
                            .build(),
                        Ruta.Parada.builder()
                            .direccion("Nazca, Av. Los Incas 100")
                            .cliente("Comercial Nazca")
                            .tiempoEstimadoMinutos(20)
                            .completada(false)
                            .build()
                    ))
                    .distanciaKm(new BigDecimal("1010.0"))
                    .tiempoEstimadoMinutos(720)
                    .estado("Planificada")
                    .prioridad("Alta")
                    .vehiculoAsignado("Trailer Volvo FH16")
                    .conductorAsignado("Miguel Sánchez")
                    .costoCombustible(new BigDecimal("850.00"))
                    .costoPeajes(new BigDecimal("180.00"))
                    .otrosCostos(new BigDecimal("120.00"))
                    .fechaPlanificada(LocalDateTime.now().plusDays(2))
                    .isActive(true)
                    .build(),

                Ruta.builder()
                    .codigo("RUTA-003")
                    .nombre("Lima a Trujillo")
                    .descripcion("Distribución rápida costa norte")
                    .origen("Lima, Ate Vitarte")
                    .destino("Trujillo, Av. España 1200")
                    .distanciaKm(new BigDecimal("560.0"))
                    .tiempoEstimadoMinutos(480)
                    .estado("Completada")
                    .prioridad("Media")
                    .vehiculoAsignado("Camión Hino 500")
                    .conductorAsignado("Luis Fernández")
                    .costoCombustible(new BigDecimal("420.00"))
                    .costoPeajes(new BigDecimal("95.00"))
                    .otrosCostos(new BigDecimal("50.00"))
                    .fechaPlanificada(LocalDateTime.now().minusDays(1))
                    .fechaInicio(LocalDateTime.now().minusDays(1))
                    .fechaFinalizacion(LocalDateTime.now().minusHours(1))
                    .isActive(true)
                    .build()
            );

            rutaRepository.saveAll(rutas);
            logger.info("✓ Rutas iniciales cargadas exitosamente");

        } catch (Exception e) {
            logger.error("Error al inicializar rutas: " + e.getMessage(), e);
        }
    }

    private void initializeClientes() {
        if (clienteRepository.count() > 0) {
            logger.info("✓ Clientes ya existen, omitiendo carga inicial");
            return;
        }

        try {
            Cliente c1 = new Cliente();
            c1.setNombre("María Rodríguez");
            c1.setEmpresa("Comercial Santa Rosa SAC");
            c1.setEmail("maria.rodriguez@santarosa.com");
            c1.setTelefono("+51 945678901");
            c1.setDireccion("Jr. Santa Rosa 234, Lima");
            c1.setCategoria("Premium");
            c1.setFechaRegistro(LocalDateTime.now().minusMonths(6));
            c1.setUltimaCompra(LocalDateTime.now().minusDays(10));
            c1.setTotalCompras(new BigDecimal("45000.00"));
            c1.setNotas("Cliente preferencial con descuentos especiales");

            Cliente c2 = new Cliente();
            c2.setNombre("Jorge Castillo");
            c2.setEmpresa("Distribuidora El Sol EIRL");
            c2.setEmail("jorge@elsol.com");
            c2.setTelefono("+51 956789012");
            c2.setDireccion("Av. El Sol 567, Arequipa");
            c2.setCategoria("Corporativo");
            c2.setFechaRegistro(LocalDateTime.now().minusYears(1));
            c2.setUltimaCompra(LocalDateTime.now().minusMonths(1));
            c2.setTotalCompras(new BigDecimal("120000.00"));

            Cliente c3 = new Cliente();
            c3.setNombre("Lucía Mendoza");
            c3.setEmpresa("Inversiones Norte SAC");
            c3.setEmail("lucia@inversionesnorte.com");
            c3.setTelefono("+51 967890123");
            c3.setDireccion("Calle Comercio 890, Trujillo");
            c3.setCategoria("Regular");
            c3.setFechaRegistro(LocalDateTime.now().minusMonths(3));
            c3.setUltimaCompra(LocalDateTime.now().minusWeeks(2));
            c3.setTotalCompras(new BigDecimal("28500.00"));

            clienteRepository.saveAll(Arrays.asList(c1, c2, c3));
            logger.info("✓ Clientes iniciales cargados exitosamente");

        } catch (Exception e) {
            logger.error("Error al inicializar clientes: " + e.getMessage(), e);
        }
    }

    private void initializeProducts() {
        if (productRepository.count() > 0) {
            logger.info("✓ Productos ya existen, omitiendo carga inicial");
            return;
        }

        try {
            Product p1 = new Product();
            p1.setCode("PROD-001");
            p1.setName("Laptop Dell Latitude");
            p1.setDescription("Laptop empresarial i7 16GB RAM");
            p1.setCategory("Tecnología");
            p1.setStock(50);
            p1.setMinStock(10);
            p1.setPrice(new BigDecimal("1200.00"));
            p1.setSupplier("TechSupply SA");
            p1.setLocation("Almacén A-101");

            Product p2 = new Product();
            p2.setCode("PROD-002");
            p2.setName("Monitor Samsung 24\"");
            p2.setDescription("Monitor LED Full HD");
            p2.setCategory("Tecnología");
            p2.setStock(100);
            p2.setMinStock(20);
            p2.setPrice(new BigDecimal("180.00"));
            p2.setSupplier("TechSupply SA");
            p2.setLocation("Almacén A-102");

            Product p3 = new Product();
            p3.setCode("PROD-003");
            p3.setName("Silla Ergonómica");
            p3.setDescription("Silla de oficina con soporte lumbar");
            p3.setCategory("Oficina");
            p3.setStock(30);
            p3.setMinStock(5);
            p3.setPrice(new BigDecimal("250.00"));
            p3.setSupplier("OfficeMax Peru");
            p3.setLocation("Almacén B-201");

            Product p4 = new Product();
            p4.setCode("PROD-004");
            p4.setName("Escritorio Gerencial");
            p4.setDescription("Escritorio de madera 1.80m");
            p4.setCategory("Oficina");
            p4.setStock(15);
            p4.setMinStock(3);
            p4.setPrice(new BigDecimal("450.00"));
            p4.setSupplier("OfficeMax Peru");
            p4.setLocation("Almacén B-202");

            Product p5 = new Product();
            p5.setCode("PROD-005");
            p5.setName("Impresora Multifuncional");
            p5.setDescription("Impresora láser color");
            p5.setCategory("Tecnología");
            p5.setStock(25);
            p5.setMinStock(5);
            p5.setPrice(new BigDecimal("350.00"));
            p5.setSupplier("TechSupply SA");
            p5.setLocation("Almacén A-103");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
            logger.info("✓ Productos iniciales cargados exitosamente");

        } catch (Exception e) {
            logger.error("Error al inicializar productos: " + e.getMessage(), e);
        }
    }
}
