const express = require('express');
const router = express.Router();

// Dashboard - Métricas generales
router.get('/stats', async (req, res) => {
  try {
    // Por ahora datos simulados - después conectaremos con los modelos reales
    const stats = {
      inventario: {
        totalProducts: 247,
        totalValue: 156780,
        lowStock: 12,
        categories: 4
      },
      clientes: {
        total: 89,
        premium: 23,
        corporativo: 31,
        regular: 35
      },
      rutas: {
        activas: 15,
        completadas: 142,
        eficienciaPromedio: 87,
        kilometrajeMes: 3240
      },
      operaciones: {
        entregasHoy: 23,
        entregasPendientes: 8,
        tiempoPromedioEntrega: 2.4,
        satisfaccionCliente: 94
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del dashboard',
      message: error.message
    });
  }
});

// Actividad reciente
router.get('/recent', (req, res) => {
  const recentActivity = [
    {
      id: 1,
      type: 'inventory',
      message: 'Stock bajo detectado en Monitor LED 24"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      priority: 'high'
    },
    {
      id: 2,
      type: 'route',
      message: 'Ruta Centro Norte completada exitosamente',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      priority: 'medium'
    },
    {
      id: 3,
      type: 'client',
      message: 'Nuevo cliente premium registrado: TechCorp SA',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      priority: 'low'
    },
    {
      id: 4,
      type: 'route',
      message: 'Optimización automática aplicada a 5 rutas',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      priority: 'medium'
    }
  ];

  res.json({
    success: true,
    data: recentActivity
  });
});

module.exports = router;