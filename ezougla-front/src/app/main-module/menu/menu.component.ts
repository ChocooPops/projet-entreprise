import { Component } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { ProjectModel } from '../../model/project.interface';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  constructor(private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  srcDeconnexion: string = './se-deconnecter.png';
  srcAdd: string = './add.png';
  srcUsers: string = './users.png';
  user !: UserModel;
  projects: ProjectModel[] = [];
  subscription: Subscription = new Subscription();
  idProjectClicked: string = '';
  activateProjects: boolean = true;

  ngOnInit(): void {
    this.subscription.add(
      this.projectService.getAllProjectsByUser().subscribe((data: ProjectModel[]) => {
        this.projects = data;
      })
    )
    this.subscription.add(
      this.userService.fetchGetUserConnected().subscribe((data: UserModel) => {
        this.user = data;
      })
    )
    this.subscription.add(
      this.projectService.getPorjectClicked().subscribe((data : string) => {
        this.idProjectClicked = data;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  projetIsClicked(id: string): boolean {
    if (this.idProjectClicked === id) {
      return true;
    } else {
      return false;
    }
  }

  onClickedProject(id: string): void {
    this.projectService.setProjectClicked(id);
    this.router.navigate(['/main/projects', id]);
  }

  onClickLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onActivateProject(): void {
    this.activateProjects = !this.activateProjects;
  }

  addNeWproject(): void {
    this.projectService.fetchCreateProject().subscribe(() => { })
  }

}
