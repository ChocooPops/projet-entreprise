import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { RegisterComponent } from './components/register/register.component';
import { Component } from '@angular/core';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent, canActivate: [AuthGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'project/:id',
        component: Component, canActivate: [AuthGuard]
    },
    {
        path: 'conversation/:id',
        component: ConversationComponent, canActivate: [AuthGuard]
    },
    {
        path: '**',
        component: HomeComponent, canActivate: [AuthGuard]
    }
];
