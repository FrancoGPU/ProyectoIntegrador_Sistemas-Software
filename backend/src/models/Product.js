const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código del producto es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['Tecnología', 'Oficina', 'Industrial', 'Consumo', 'Otros']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  minStock: {
    type: Number,
    required: [true, 'El stock mínimo es obligatorio'],
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0.01, 'El precio debe ser mayor a 0']
  },
  supplier: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: 'Almacén Principal'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para estado del stock
productSchema.virtual('stockStatus').get(function() {
  if (this.stock <= this.minStock) {
    return 'low';
  } else if (this.stock <= this.minStock * 1.5) {
    return 'medium';
  }
  return 'good';
});

// Virtual para valor total del inventario
productSchema.virtual('totalValue').get(function() {
  return this.stock * this.price;
});

// Índices para optimizar búsquedas
productSchema.index({ code: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Middleware pre-save
productSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);