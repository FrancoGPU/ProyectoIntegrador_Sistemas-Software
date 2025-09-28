const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');

// Rutas para inventario
router.get('/', inventarioController.getAllProducts);
router.get('/stats', inventarioController.getInventoryStats);
router.get('/:id', inventarioController.getProductById);
router.post('/', inventarioController.createProduct);
router.put('/:id', inventarioController.updateProduct);
router.patch('/:id/stock', inventarioController.updateStock);
router.delete('/:id', inventarioController.deleteProduct);

module.exports = router;