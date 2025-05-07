import { Component, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ProfilePhotoModel } from '../../model/profil-photo.interface';
import { CreateFileModel } from '../../model/create-file.interface';
import { NgClass } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  imports: [NgClass],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {

  profilPhotos: ProfilePhotoModel[] = [];
  srcInputPicture: string = './new-file.png';
  constructor(private userService: UserService) {
    this.profilPhotos = this.userService.getProfilPhotoBlob();
  }

  onClickPhoto(photo: ProfilePhotoModel): void {
    this.userService.fetchChangeProfilPhoto(photo).subscribe(() => { });
  }

  onClickPage(): void {
    this.userService.setDisplayEditUser(false);
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  isDragging: boolean = false;

  private handleFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      const createFile: CreateFileModel = {
        idProjects: 'garzgerththt',
        file: base64,
        name: file.name
      }
      this.userService.fetchChangeProfilPhotoPersonalized(createFile).pipe(take(1)).subscribe(() => { });
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
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
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
