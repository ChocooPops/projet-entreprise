import { Component, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectModel } from '../../model/project.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { take } from 'rxjs';
import { FileService } from '../../services/file/file.service';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../model/task.interface';
import { FileModel } from '../../model/file.interface';
import { FileComponent } from '../file/file.component';
import { TaskComponent } from '../task/task.component';
import { CreateFileModel } from '../../model/create-file.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, FileComponent, TaskComponent, NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  subscription: Subscription = new Subscription();
  subscriptionTask !: Subscription;
  subscriptionFile !: Subscription;
  project !: ProjectModel | undefined;
  formGroupName!: FormGroup;
  formGroupDescription !: FormGroup;
  user !: UserModel;
  srcDelete: string = './poubelle.png';
  tasks: TaskModel[] = [];
  files: FileModel[] = [];

  constructor(private projectService: ProjectService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private fileService: FileService,
    private taskService: TaskService
  ) {

  }

  ngOnInit(): void {
    this.loadFormName();
    this.loadFormDescription();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if(id) {
        this.projectService.setProjectClicked(id);
      }
      this.subscription.add(this.projectService.getAllProjectsByUser().subscribe((projects: ProjectModel[]) => {
        this.project = projects.find((pro) => pro.id === id);
        this.loadFormName();
        this.loadFormDescription();
        this.setTaskAndFile();
      })
      )
    });

    this.subscription.add(
      this.userService.fetchGetUserConnected().subscribe(user => {
        this.user = user
        this.loadFormName();
        this.loadFormDescription();
      })
    )
  }

  setUser(): void {
    this.subscription.add(
      this.userService.fetchGetUserConnected().subscribe(user => {
        this.user = user
        this.loadFormName();
        this.loadFormDescription();
      })
    )
  }

  setTaskAndFile(): void {
    if (this.project) {
      this.subscriptionFile = this.fileService.fetchGetFileByProject(this.project.id).subscribe((data) => {
        this.files = data;
      })
      this.subscriptionTask = this.taskService.fetchTasksByProject(this.project.id).subscribe((data) => {
        this.tasks = data
      })
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionFile.unsubscribe();
    this.subscriptionTask.unsubscribe();
  }

  loadFormName(): void {
    this.formGroupName = this.fb.group({
      inputName: [this.project?.name || ''],
    });

    if (this.user && (this.user.role === 'DIRECTOR' || this.user.role === 'MANAGER')) {
      this.formGroupName.get('inputName')?.enable();
    } else {
      this.formGroupName.get('inputName')?.disable();
    }
  }

  loadFormDescription(): void {
    this.formGroupDescription = this.fb.group({
      inputDescription: [this.project?.description],
    });
    if (this.user && (this.user.role === 'DIRECTOR' || this.user.role === 'MANAGER')) {
      this.formGroupDescription.get('inputDescription')?.enable();
    } else {
      this.formGroupDescription.get('inputDescription')?.disable();
    }
  }

  onInputBlurName(): void {
    const name = this.formGroupName.get('inputName')?.value;
    if (this.project) {
      this.projectService.fetchUpdatName(this.project?.id, name).pipe(take(1)).subscribe(() => { });
    }
  }

  onInputBlurDescription(): void {
    const description = this.formGroupDescription.get('inputDescription')?.value;
    if (this.project) {
      this.projectService.fetchUpdatDescription(this.project?.id, description).pipe(take(1)).subscribe(() => { });
    }
  }

  onClickDelete(): void {
    if (this.project) {
      this.projectService.fetDeleteById(this.project?.id).pipe(take(1)).subscribe(() => { });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const reader = new FileReader();
  
    reader.onload = () => {
      const base64 = reader.result as string;
      if (this.project) {
        const createFile: CreateFileModel = {
          idProjects: this.project.id,
          file: base64,
          name: file.name
        };
        this.fileService.fetchCreateFileInProject(createFile).pipe(take(1)).subscribe((file) => {
          this.files.push(file);
        });
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

  deleteFileWhenEmit(file : FileModel) : void {
    this.files = this.files.filter((item) => item.id !== file.id);
  }

  isDragging : boolean = false;

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
