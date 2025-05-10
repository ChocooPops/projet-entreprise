import { Component, ViewChild, ElementRef, QueryList, ViewChildren, HostListener } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { TaskService } from '../../services/task/task.service';
import { FileService } from '../../services/file/file.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, take, tap, switchMap, map, filter } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { ProjectModel } from '../../model/project.interface';
import { FileModel } from '../../model/file.interface';
import { TaskModel } from '../../model/task.interface';
import { CreateFileModel } from '../../model/create-file.interface';
import { FileComponent } from '../file/file.component';
import { NgClass } from '@angular/common';
import { SyncColumnWidthDirective } from '../sync-column-width.directive';

@Component({
  selector: 'app-detail-project',
  imports: [ReactiveFormsModule, NgClass, FileComponent, SyncColumnWidthDirective],
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.css'
})
export class DetailProjectComponent {

  currentUser: UserModel | undefined;
  usersActivate: UserModel[] = [];
  assignedUsers: UserModel[] = [];

  tasks: TaskModel[] = [];
  files: FileModel[] = [];

  subscriptionTask !: Subscription;
  subscriptionFile !: Subscription;
  subscriptionProject !: Subscription;
  subscriptionUser !: Subscription;
  project !: ProjectModel | undefined;

  srcAddFile: string = './add.png';
  srcAddUser: string = './add-user.png';
  srcDelete: string = './poubelle.png';
  srcAddTask: string = './add-task.png';
  srcDeleteTask: string = './remove-task.png';
  srcChangeStatus: string = './change-status.png';

  formGroupDescription !: FormGroup;
  taskStatus: string[] = [
    'TODO',
    'IN_PROGRESS',
    'DONE'
  ]

  @ViewChildren('autoArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(private projectService: ProjectService,
    private taskService: TaskService,
    private fileService: FileService,
    private userService: UserService,
    private fb: FormBuilder,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.subscriptionProject = this.projectService.getPorjectClicked().pipe(
      tap(() => {
        this.assignedUsers = [];
        this.currentTaskClickedForUsers = undefined;
      }),
      switchMap((id: string) =>
        this.projectService.getAllProjectsByUser().pipe(
          map((projects: ProjectModel[]) => projects.find((pro) => pro.id === id)),
          tap((project) => {
            this.project = project;
            this.loadFormDescription();
            this.setTaskAndFile();
          }),
          filter((project): project is ProjectModel => !!project),
          switchMap(() => this.userService.getUserTab())
        )
      )
    ).subscribe((usersTab: UserModel[] | undefined) => {
      this.usersActivate = usersTab?.filter((u) => u.role !== 'NOT_ACTIVATE') || [];
      this.assignedUsers = this.project?.assignedUsers
        ?.map((assignedUser) => this.usersActivate.find((u) => u.id === assignedUser.id))
        .filter((u): u is UserModel => !!u) || [];

    });
    this.subscriptionUser =
      this.userService.getUserSubject().subscribe(user => {
        this.currentUser = user;
        this.loadFormDescription();
      })
  }

  ngOnDestroy(): void {
    this.subscriptionFile.unsubscribe();
    this.subscriptionTask.unsubscribe();
    this.subscriptionUser.unsubscribe();
    this.subscriptionProject.unsubscribe();
  }

  setHeighTexArea() {
    setTimeout(() => {
      this.textareas.forEach(textareaRef => {
        const el = textareaRef.nativeElement;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      });
    }, 10);
  }

  loadFormDescription(): void {
    this.formGroupDescription = this.fb.group({
      inputDescription: [this.project?.description],
    });
    if (this.currentUser && (this.currentUser.role === 'DIRECTOR' || this.currentUser.role === 'MANAGER')) {
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
        this.setHeighTexArea()
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
  currentTaskClickedForStatus: string = '';
  currentTaskClickedForUsers: string | undefined = undefined;

  onMouseEnter(userId: string): void {
    this.isUserHovering = userId;
  }

  onMouseLeave(): void {
    this.isUserHovering = '';
  }

  onClicAddNewUser(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentUser?.role === 'DIRECTOR' || this.currentUser?.role === 'MANAGER') {
      this.isClickOnAddUser = true;
    }
    this.currentTaskClickedForStatus = '';
    this.currentTaskClickedForUsers = undefined;
  }

  onClickPage(): void {
    this.isClickOnAddUser = false;
    this.currentTaskClickedForStatus = '';
    this.currentTaskClickedForUsers = undefined;
  }

  assignedUserByIdIntoProject(userId: string) {
    if (this.project) {
      this.projectService.fetchAssignedUserIntoProjectById(userId, this.project.id).subscribe(() => {
        this.isClickOnAddUser = false;
      });
    }
  }

  unassignedUserByIdIntoProject(userId: string): void {
    if (this.project) {
      this.projectService.fetchUnassignedUserIntoProjectById(userId, this.project.id).subscribe(() => { });
    }
  }

  onClickAddTask(): void {
    if (this.project) {
      this.taskService.fetchCreateEmptyTask(this.project.id).subscribe((data: TaskModel) => {
        this.tasks.push(data)
      })
    }
  }

  onClickRemoveTask(taskId: string): void {
    this.taskService.fetchDeleteTaskById(taskId).subscribe((data: TaskModel) => {
      this.tasks = this.tasks.filter((task) => task.id !== data.id);
    })
  }

  onBlurTitleTask(taskId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.taskService.fetchUpdateTitleTask(taskId, value).subscribe((data) => {
      const index: number = this.tasks.findIndex((task) => task.id === data.id);
      if (index >= 0) {
        this.tasks[index].title = data.title;
      }
    })
  }

  onBlurDescriptionTask(taskId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.taskService.fetchUpdateDescriptionTask(taskId, value).subscribe((data) => {
      const index: number = this.tasks.findIndex((task) => task.id === data.id);
      if (index >= 0) {
        this.tasks[index].description = data.description;
      }
    })
  }

  onClickChangeStatus(taskId: string, status: string): void {
    this.taskService.fetchUpdateStatusTask(taskId, status).subscribe((data) => {
      const index: number = this.tasks.findIndex((task) => task.id === data.id);
      if (index >= 0) {
        this.tasks[index].status = data.status;
      }
      this.currentTaskClickedForStatus = '';
    })
  }

  onClickedDisplayAllStatus(taskId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.currentTaskClickedForStatus = taskId;
    this.currentTaskClickedForUsers = undefined;
    this.isClickOnAddUser = false;
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  addUserToTask(idUser: string, event: MouseEvent): void {
    event.stopPropagation();
    this.currentTaskClickedForStatus = '';
    this.isClickOnAddUser = false;
    if (this.currentTaskClickedForUsers) {
      this.taskService.fetchAssignedNewUserToTask(this.currentTaskClickedForUsers, idUser).subscribe((data) => {
        const index: number = this.tasks.findIndex((task) => task.id === data.id);
        if (index >= 0) {
          this.tasks[index].assignedUsers = data.assignedUsers;
        }
        this.currentTaskClickedForUsers = undefined;
      })
    }
  }

  deleteUserTask(taskId: string, userId: string) {
    this.taskService.fetchUnassignedUserToTask(taskId, userId).subscribe((data) => {
      const index: number = this.tasks.findIndex((task) => task.id === data.id);
      if (index >= 0) {
        this.tasks[index].assignedUsers = data.assignedUsers;
      }
    })
  }

  offsetX: number = 0;
  offsetY: number = 0;

  onClickDisplayUserAvailable(taskId: string, event: MouseEvent) {
    this.currentTaskClickedForUsers = taskId;
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    event.stopPropagation();
    this.currentTaskClickedForStatus = '';
    this.isClickOnAddUser = false;
    this.offsetX = rect.left - 5;
    this.offsetY = rect.top + 25;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.textareas.forEach(textareaRef => {
      const el = textareaRef.nativeElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
    this.currentTaskClickedForUsers = undefined;
  }

  getAllUsersActivateNotAssignedToProject(): UserModel[] {
    return this.usersActivate.filter(
      user => !this.assignedUsers.some(assigned => assigned.id === user.id)
    );
  }

  getAllUsersIntoProjectNotAssignedToTask(): UserModel[] {
    if (this.currentTaskClickedForUsers) {
      const taskUsers: UserModel[] | undefined = this.tasks.find(
        (task) => task.id === this.currentTaskClickedForUsers
      )?.assignedUsers;

      if (taskUsers) {
        return this.assignedUsers.filter(
          user => !taskUsers.some(taskUser => taskUser.id === user.id)
        );
      } else {
        return [...this.assignedUsers];
      }
    } else {
      return [];
    }
  }

}
