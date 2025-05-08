import { Component, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { TaskService } from '../../services/task/task.service';
import { FileService } from '../../services/file/file.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { ProjectModel } from '../../model/project.interface';
import { FileModel } from '../../model/file.interface';
import { TaskModel } from '../../model/task.interface';
import { CreateFileModel } from '../../model/create-file.interface';
import { TaskComponent } from '../task/task.component';
import { FileComponent } from '../file/file.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-detail-project',
  imports: [ReactiveFormsModule, NgClass, TaskComponent, FileComponent],
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.css'
})
export class DetailProjectComponent {

  listUsers: UserModel[] | undefined = [];
  tasks: TaskModel[] = [];
  files: FileModel[] = [];
  user: UserModel | undefined;
  subscriptionTask !: Subscription;
  subscriptionFile !: Subscription;
  subscriptionProject !: Subscription;
  subscriptionUser !: Subscription;
  project !: ProjectModel | undefined;

  srcAddFile: string = './add.png';
  srcAddUser: string = './add-user.png';
  srcDelete: string = './poubelle.png';
  assignedUsers: UserModel[] = [];

  formGroupDescription !: FormGroup;

  constructor(private projectService: ProjectService,
    private taskService: TaskService,
    private fileService: FileService,
    private userService: UserService,
    private fb: FormBuilder,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.subscriptionProject =
      this.projectService.getPorjectClicked().subscribe((id) => {
        this.assignedUsers = []
        this.projectService.getAllProjectsByUser().subscribe((projects: ProjectModel[]) => {
          this.project = projects.find((pro) => pro.id === id);
          if (this.project) {
            this.userService.getUserTab().subscribe((usersTab: UserModel[] | undefined) => {
              this.listUsers = usersTab;
              this.assignedUsers = []
              this.project?.assignedUsers.forEach((user) => {
                if (usersTab) {
                  const userTmp = usersTab.find(item => item.id === user.id);
                  if (userTmp) {
                    this.assignedUsers.push(userTmp);
                  }
                }
              });
            });
          }
          this.loadFormDescription();
          this.setTaskAndFile();
        })
      })
    this.subscriptionUser =
      this.userService.getUserSubject().subscribe(user => {
        this.user = user;
        this.loadFormDescription();
      })
  }

  ngOnDestroy(): void {
    this.subscriptionFile.unsubscribe();
    this.subscriptionTask.unsubscribe();
    this.subscriptionUser.unsubscribe();
    this.subscriptionProject.unsubscribe();
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

  onInputBlurDescription(): void {
    const description = this.formGroupDescription.get('inputDescription')?.value;
    if (this.project) {
      this.projectService.fetchUpdatDescription(this.project?.id, description).pipe(take(1)).subscribe(() => { });
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

  deleteFileWhenEmit(file: FileModel): void {
    this.files = this.files.filter((item) => item.id !== file.id);
  }

  isDragging: boolean = false;

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

  isClickOnAddUser: boolean = false;
  isUserHovering: string = '';

  onMouseEnter(userId: string): void {
    this.isUserHovering = userId;
  }

  onMouseLeave(): void {
    this.isUserHovering = '';
  }

  onClicAddNewUser(event: MouseEvent): void {
    event.stopPropagation();
    this.isClickOnAddUser = true;
  }

  onClickPage(): void {
    this.isClickOnAddUser = false;
  }

  assignedUserByIdIntoProject(userId: string) {
    if (this.project) {
      this.projectService.fetchAssignedUserIntoProjectById(userId, this.project.id).subscribe(() => { });
    }
  }

  unassignedUserByIdIntoProject(userId: string): void {
    if (this.project) {
      this.projectService.fetchUnassignedUserIntoProjectById(userId, this.project.id).subscribe(() => { });
    }
  }

}
