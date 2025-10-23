import { Routes } from '@angular/router';
import {
  DashboardComponent,
  InventarioComponent,
  ClientesComponent,
  ProveedoresComponent,
  RutasComponent,
  FodaComponent
} from './pages';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'rutas', component: RutasComponent },
  { path: 'foda', component: FodaComponent },
  { path: '**', redirectTo: '/dashboard' }
];
