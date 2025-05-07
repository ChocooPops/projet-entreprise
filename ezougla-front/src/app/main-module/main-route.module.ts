import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { ConversationComponent } from './conversation/conversation.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ManageUserComponent } from './manage-user/manage-user.component';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'projects/:id',
        component: ProjectsComponent
      },
      {
        path: 'conversation/:id',
        component: ConversationComponent
      },
      {
        path : 'manage-user',
        component : ManageUserComponent
      },
      {
        path: '**',
        component: HomeComponent,
      }
    ]
  },
  {
    path: '**',
    component: MainPageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }