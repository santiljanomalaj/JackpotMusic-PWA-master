import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouteNotFoundComponent } from './components/route-not-found/route-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/user/detail', pathMatch: 'full' },
  { path: 'auth', loadChildren: './pages/auth/auth.module#AuthModule' },
  { path: 'user', loadChildren: './pages/user/user.module#UserModule' },
  { path: 'game', loadChildren: './pages/game/game.module#GameModule' },
  { path: '**', component: RouteNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
