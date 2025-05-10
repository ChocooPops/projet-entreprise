import { Component, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { ProfilePhotoModel } from '../../model/profil-photo.interface';
import { Subscription, take } from 'rxjs';
import { CreateFileModel } from '../../model/create-file.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-edit-project-back',
  imports: [NgClass],
  templateUrl: './edit-project-back.component.html',
  styleUrl: './edit-project-back.component.css'
})
export class EditProjectBackComponent {

  photos: ProfilePhotoModel[] = [];
  srcInputPicture: string = './new-file.png';
  projectId: string | undefined = undefined
  subscription !: Subscription;

  constructor(private projectService: ProjectService) {
    this.photos = this.projectService.getBackgroundPhotoProject();
  }

  ngOnInit(): void {
    this.subscription = this.projectService.getPorjectClicked().subscribe((id) => {
      this.projectId = id;
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  isDragging: boolean = false;

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      console.warn('Seuls les fichiers image sont acceptés.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      if (this.projectId) {
        const createFile: CreateFileModel = {
          idProjects: this.projectId,
          file: base64,
          name: file.name
        }
        this.projectService.fetchUpdateBackProjectPersonalized(createFile).pipe(take(1)).subscribe(() => { });
      }
    };

    reader.onerror = (error) => {
      console.error('Erreur de lecture du fichier :', error);
    };

    reader.readAsDataURL(file);
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];

    if (file && file.type.startsWith('image/')) {
      this.handleFile(file);
    } else {
      console.warn('Seuls les fichiers image sont acceptés.');
    }

    this.isDragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    this.isDragging = false;
  }
}
