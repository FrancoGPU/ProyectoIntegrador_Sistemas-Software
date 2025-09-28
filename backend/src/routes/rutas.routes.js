const express = require('express');
const router = express.Router();
const RouteOptimizationService = require('../services/routeOptimization.service');

const routeService = new RouteOptimizationService();

// GET /api/rutas - Obtener todas las rutas
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de rutas activa',
    data: [],
    provider: routeService.getProviderInfo()
  });
});

// POST /api/rutas/optimize - Optimización REAL de rutas
router.post('/optimize', async (req, res) => {
  try {
    const { deliveries = [], vehicles = [], preferences = {} } = req.body;
    
    // Validación básica
    if (deliveries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere al menos una entrega para optimizar'
      });
    }

    console.log(`🚚 Iniciando optimización con ${deliveries.length} entregas...`);
    
    // Ejecutar optimización REAL
    const result = await routeService.optimizeRoutes(deliveries, vehicles, preferences);
    
    res.json({
      success: true,
      message: `Optimización completada con ${result.provider}`,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en optimización:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error en la optimización de rutas',
      message: error.message,
      provider: routeService.mapProvider
    });
  }
});

// POST /api/rutas/provider - Cambiar proveedor de mapas
router.post('/provider', (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere especificar el proveedor'
      });
    }

    routeService.setMapProvider(provider);
    
    res.json({
      success: true,
      message: `Proveedor cambiado a ${provider}`,
      data: routeService.getProviderInfo()
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rutas/provider - Obtener información del proveedor
router.get('/provider', (req, res) => {
  res.json({
    success: true,
    data: routeService.getProviderInfo()
  });
});

// POST /api/rutas/geocode - Geocodificar direcciones
router.post('/geocode', async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de direcciones'
      });
    }

    const results = await routeService.geocodeAddresses(addresses);
    
    res.json({
      success: true,
      data: results,
      provider: routeService.mapProvider,
      summary: {
        total: addresses.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en geocodificación',
      message: error.message
    });
  }
});

module.exports = router;