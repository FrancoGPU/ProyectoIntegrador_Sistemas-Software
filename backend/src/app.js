require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Importar rutas
const inventarioRoutes = require('./routes/inventario.routes');
const clientesRoutes = require('./routes/clientes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const rutasRoutes = require('./routes/rutas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://logistock:logistock123@mongodb:27017/logistockdb?authSource=admin';

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Configuración CORS para Angular
app.use(cors({
  origin: ['http://localhost:4200', 'https://*.githubpreview.dev', 'https://*.github.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('🍃 Conectado a MongoDB exitosamente');
  console.log('📊 Base de datos: logistockdb');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
  process.exit(1);
});

// Configuración de eventos de MongoDB
mongoose.connection.on('error', (error) => {
  console.error('❌ Error de MongoDB:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
});

// Ruta de salud del servidor
app.get('/', (req, res) => {
  res.json({
    message: '🚚 LogiStock Solutions API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Rutas de la API
app.use('/api/inventario', inventarioRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableRoutes: [
      '/api/inventario',
      '/api/clientes', 
      '/api/proveedores',
      '/api/rutas',
      '/api/dashboard'
    ]
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  
  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Error de validación',
      details: messages
    });
  }
  
  // Error de duplicado (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      error: 'Dato duplicado',
      message: `El ${field} ya existe en la base de datos`
    });
  }
  
  // Error de cast (ID inválido)
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'El ID proporcionado no tiene un formato válido'
    });
  }
  
  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo salió mal' 
      : error.message
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LogiStock Solutions API ejecutándose en puerto ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;