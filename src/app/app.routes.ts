import { Routes } from '@angular/router';
import {
  DashboardComponent,
  InventarioComponent,
  ClientesComponent,
  ProveedoresComponent,
  RutasComponent,
} from './pages';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [authGuard] },
  { path: 'rutas', component: RutasComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' },
];
