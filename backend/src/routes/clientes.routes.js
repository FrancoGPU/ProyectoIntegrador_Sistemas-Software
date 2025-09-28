const express = require('express');
const router = express.Router();

// Rutas temporales para clientes - placeholder
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de clientes - En construcción',
    data: []
  });
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 0,
      premium: 0,
      corporativo: 0,
      regular: 0
    }
  });
});

module.exports = router;