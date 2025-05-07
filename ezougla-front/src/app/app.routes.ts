import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guard/auth.guard';
import { MainPageComponent } from './main-module/main-page/main-page.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './main-module/home/home.component';

export const routes: Routes = [
    {
        path : 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'main',
        loadChildren: () => import('./main-module/main-route.module').then((m) => m.MainRoutingModule), 
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        component: MainPageComponent, canActivate: [AuthGuard],
        children : [
            {
            path: '**',
              component: HomeComponent,
            }
        ]
    }
];
