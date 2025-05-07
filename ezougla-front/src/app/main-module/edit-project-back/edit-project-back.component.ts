import { Component } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { ProfilePhotoModel } from '../../model/profil-photo.interface';

@Component({
  selector: 'app-edit-project-back',
  imports: [],
  templateUrl: './edit-project-back.component.html',
  styleUrl: './edit-project-back.component.css'
})
export class EditProjectBackComponent {

  photos: ProfilePhotoModel[] = [];

  constructor(private projectService: ProjectService) {
    this.photos = this.projectService.getBackgroundPhotoProject();
  }

  onClickPage(): void {
    this.projectService.setDisplayEditProject(false);
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClickPhoto(photo: ProfilePhotoModel): void {
    this.projectService.fetchUpdateBackProject(photo).subscribe((id) => {

    })
  }

}
