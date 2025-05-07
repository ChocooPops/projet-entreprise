import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserService } from '../../services/user/user.service';
import { EditProjectBackComponent } from '../edit-project-back/edit-project-back.component';
import { ProjectService } from '../../services/project/project.service';

@Component({
  selector: 'app-main-page',
  imports: [RouterOutlet, MenuComponent, EditUserComponent, EditProjectBackComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  isResizing = false;
  displayEditUser: boolean = false;
  displayEditProject: boolean = true;

  constructor(private userService: UserService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.userService.getDisplayEditUser().subscribe((state) => {
      this.displayEditUser = state;
    })

    this.projectService.getDisplayEditProject().subscribe((state) => {
      this.displayEditProject = state;
    })
  }

  onMouseDown(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const container = document.querySelector('.container') as HTMLElement;
    const left = document.querySelector('.left') as HTMLElement;
    const containerOffsetLeft = container.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;
    const newLeftWidth = (pointerRelativeXpos / container.clientWidth) * 100;

    left.style.width = `${newLeftWidth}%`;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }
}
