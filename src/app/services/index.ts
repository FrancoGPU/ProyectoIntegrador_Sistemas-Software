/**
 * Barrel file para exportar todos los servicios
 * Esto permite importaciones más limpias:
 * import { ApiService, DashboardService, InventarioService } from './services';
 */

export { ApiService } from './api.service';
export { DashboardService } from './dashboard.service';
export { InventarioService } from './inventario.service';
export type { Product, InventoryFilters, InventoryStats } from './inventario.service';
export { ClientesService } from './clientes.service';
export { ProveedoresService } from './proveedores.service';
export { RutasService } from './rutas.service';
