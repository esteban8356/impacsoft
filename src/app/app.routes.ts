import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { LandingComponent } from './components/landing/landing';
import { AuthGuard } from './guards/auth-guard';

import { CaseDetailComponent } from './components/case-detail/case-detail';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'casos/:id', component: CaseDetailComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/' }
];
