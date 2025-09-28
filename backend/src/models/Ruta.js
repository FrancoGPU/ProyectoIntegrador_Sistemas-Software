const mongoose = require('mongoose');

const rutaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la ruta es obligatorio'],
    trim: true
  },
  conductor: {
    type: String,
    required: [true, 'El conductor es obligatorio'],
    trim: true
  },
  origen: {
    type: String,
    required: [true, 'El origen es obligatorio'],
    trim: true
  },
  destino: {
    type: String,
    required: [true, 'El destino es obligatorio'],
    trim: true
  },
  // Coordenadas para optimización
  origenCoords: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  destinoCoords: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  distancia: {
    type: Number,
    required: [true, 'La distancia es obligatoria'],
    min: [0.1, 'La distancia debe ser mayor a 0']
  },
  tiempoEstimado: {
    type: Number,
    required: [true, 'El tiempo estimado es obligatorio'],
    min: [0.1, 'El tiempo debe ser mayor a 0']
  },
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: ['Planificada', 'En Tránsito', 'Completada', 'Retrasada', 'Cancelada'],
      message: 'Estado inválido'
    },
    default: 'Planificada'
  },
  prioridad: {
    type: String,
    required: [true, 'La prioridad es obligatoria'],
    enum: {
      values: ['Alta', 'Media', 'Baja'],
      message: 'Prioridad inválida'
    },
    default: 'Media'
  },
  eficiencia: {
    type: Number,
    min: [0, 'La eficiencia no puede ser negativa'],
    max: [100, 'La eficiencia no puede ser mayor a 100'],
    default: 85
  },
  // Información del vehículo
  vehiculo: {
    tipo: { type: String, default: 'Camión' },
    placa: { type: String, trim: true },
    capacidad: { type: Number, default: 1000 }
  },
  // Entregas asociadas
  entregas: [{
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente'
    },
    direccion: String,
    horarioPreferido: String,
    estado: {
      type: String,
      enum: ['Pendiente', 'Entregada', 'Fallida'],
      default: 'Pendiente'
    }
  }],
  // Métricas
  kilometraje: {
    type: Number,
    default: 0
  },
  combustibleUsado: {
    type: Number,
    default: 0
  },
  costoTotal: {
    type: Number,
    default: 0
  },
  fechaInicio: {
    type: Date,
    default: null
  },
  fechaFin: {
    type: Date,
    default: null
  },
  notas: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para duración real
rutaSchema.virtual('duracionReal').get(function() {
  if (!this.fechaInicio || !this.fechaFin) return null;
  return Math.abs(this.fechaFin - this.fechaInicio) / (1000 * 60 * 60); // en horas
});

// Virtual para estado de eficiencia
rutaSchema.virtual('estadoEficiencia').get(function() {
  if (this.eficiencia >= 90) return 'excelente';
  if (this.eficiencia >= 75) return 'buena';
  if (this.eficiencia >= 60) return 'regular';
  return 'baja';
});

// Índices
rutaSchema.index({ estado: 1 });
rutaSchema.index({ conductor: 1 });
rutaSchema.index({ fechaInicio: 1 });
rutaSchema.index({ prioridad: 1, estado: 1 });

// Middleware para calcular eficiencia automáticamente
rutaSchema.pre('save', function(next) {
  if (this.fechaInicio && this.fechaFin && this.tiempoEstimado) {
    const tiempoReal = this.duracionReal;
    this.eficiencia = Math.max(0, Math.min(100, 
      Math.round((this.tiempoEstimado / tiempoReal) * 100)
    ));
  }
  next();
});

module.exports = mongoose.model('Ruta', rutaSchema);