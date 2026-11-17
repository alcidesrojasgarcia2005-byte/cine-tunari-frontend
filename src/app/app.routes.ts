import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { Catalog } from './pages/catalog/catalog';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { TitleDetail } from './pages/title-detail/title-detail';
import { Watch } from './pages/watch/watch';

export const routes: Routes = [
  { path: '', component: Catalog },
  { path: 'titulo/:id', component: TitleDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'watch/:id', component: Watch, canActivate: [authGuard] },
  // La administración se carga aparte (lazy) para no engordar la carga inicial
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
