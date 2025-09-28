const express = require('express');
const router = express.Router();

// Rutas temporales para proveedores - placeholder
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de proveedores - En construcción',
    data: []
  });
});

module.exports = router;