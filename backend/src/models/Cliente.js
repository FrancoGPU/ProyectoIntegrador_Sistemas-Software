const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del cliente es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  empresa: {
    type: String,
    required: [true, 'La empresa es obligatoria'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido']
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['Premium', 'Corporativo', 'Regular'],
      message: 'La categoría debe ser Premium, Corporativo o Regular'
    },
    default: 'Regular'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  ultimaCompra: {
    type: Date,
    default: null
  },
  totalCompras: {
    type: Number,
    default: 0,
    min: [0, 'El total de compras no puede ser negativo']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notas: {
    type: String,
    trim: true,
    default: ''
  },
  // Información adicional
  contactoSecundario: {
    nombre: String,
    telefono: String,
    email: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para nombre completo con empresa
clienteSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} (${this.empresa})`;
});

// Virtual para días desde última compra
clienteSchema.virtual('diasSinCompra').get(function() {
  if (!this.ultimaCompra) return null;
  const diffTime = Math.abs(new Date() - this.ultimaCompra);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Índices
clienteSchema.index({ email: 1 });
clienteSchema.index({ categoria: 1 });
clienteSchema.index({ empresa: 1 });
clienteSchema.index({ nombre: 'text', empresa: 'text' });

// Middleware pre-save
clienteSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Cliente', clienteSchema);