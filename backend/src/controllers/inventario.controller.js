const Product = require('../models/Product');
const Joi = require('joi');

// Esquema de validación
const productSchema = Joi.object({
  code: Joi.string().required().trim().uppercase(),
  name: Joi.string().required().trim().min(2),
  description: Joi.string().allow('').trim(),
  category: Joi.string().required().valid('Tecnología', 'Oficina', 'Industrial', 'Consumo', 'Otros'),
  stock: Joi.number().integer().min(0).required(),
  minStock: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().required(),
  supplier: Joi.string().allow('').trim(),
  location: Joi.string().allow('').trim()
});

const inventarioController = {
  // GET /api/inventario - Obtener todos los productos
  async getAllProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        category = '', 
        sortBy = 'name',
        sortOrder = 'asc',
        stockStatus = ''
      } = req.query;

      // Construir filtros
      const filters = { isActive: true };
      
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) {
        filters.category = category;
      }

      // Filtro por estado de stock
      if (stockStatus === 'low') {
        filters.$expr = { $lte: ['$stock', '$minStock'] };
      } else if (stockStatus === 'medium') {
        filters.$expr = { 
          $and: [
            { $gt: ['$stock', '$minStock'] },
            { $lte: ['$stock', { $multiply: ['$minStock', 1.5] }] }
          ]
        };
      } else if (stockStatus === 'good') {
        filters.$expr = { $gt: ['$stock', { $multiply: ['$minStock', 1.5] }] };
      }

      // Paginación y ordenamiento
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [products, total] = await Promise.all([
        Product.find(filters)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(filters)
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + products.length < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos',
        message: error.message
      });
    }
  },

  // GET /api/inventario/stats - Estadísticas del inventario
  async getInventoryStats(req, res) {
    try {
      const stats = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
            totalStock: { $sum: '$stock' },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
              }
            },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);

      const categoryStats = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          general: stats[0] || {
            totalProducts: 0,
            totalValue: 0,
            totalStock: 0,
            lowStockCount: 0,
            avgPrice: 0
          },
          byCategory: categoryStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
        message: error.message
      });
    }
  },

  // GET /api/inventario/:id - Obtener un producto
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener producto',
        message: error.message
      });
    }
  },

  // POST /api/inventario - Crear producto
  async createProduct(req, res) {
    try {
      const { error, value } = productSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación incorrectos',
          details: error.details.map(detail => detail.message)
        });
      }

      const product = new Product(value);
      await product.save();

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'El código del producto ya existe'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear producto',
        message: error.message
      });
    }
  },

  // PUT /api/inventario/:id - Actualizar producto
  async updateProduct(req, res) {
    try {
      const { error, value } = productSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación incorrectos',
          details: error.details.map(detail => detail.message)
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar producto',
        message: error.message
      });
    }
  },

  // PATCH /api/inventario/:id/stock - Actualizar solo el stock
  async updateStock(req, res) {
    try {
      const { stock } = req.body;
      
      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({
          success: false,
          error: 'El stock debe ser un número mayor o igual a 0'
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Stock actualizado exitosamente',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar stock',
        message: error.message
      });
    }
  },

  // DELETE /api/inventario/:id - Eliminar producto (soft delete)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al eliminar producto',
        message: error.message
      });
    }
  }
};

module.exports = inventarioController;