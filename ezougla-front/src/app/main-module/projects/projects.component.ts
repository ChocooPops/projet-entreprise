import { Component } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectModel } from '../../model/project.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { DetailProjectComponent } from '../detail-project/detail-project.component';
import { CreateFileModel } from '../../model/create-file.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, DetailProjectComponent, NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  subscription: Subscription = new Subscription();

  subscriptionUpload !: Subscription;
  project !: ProjectModel | undefined;
  formGroupName!: FormGroup;

  user: UserModel | undefined;
  srcDelete: string = './poubelle.png';
  srcEdit: string = './add.png';
  srcTask: string = './tache.png';
  srcMessage: string = './message.png';

  displayEditProject: boolean = true;

  constructor(private projectService: ProjectService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.loadFormName();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectService.setProjectClicked(id);
      }
      this.subscription.add(this.projectService.getAllProjectsByUser().subscribe((projects: ProjectModel[]) => {
        this.project = projects.find((pro) => pro.id === id);
        this.loadFormName();
      })
      )
    });
    this.subscription.add(
      this.userService.getUserSubject().subscribe(user => {
        this.user = user
        this.loadFormName();
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.projectService.setProjectClicked('');
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

  onInputBlurName(): void {
    const name = this.formGroupName.get('inputName')?.value;
    if (this.project) {
      this.projectService.fetchUpdatName(this.project?.id, name).pipe(take(1)).subscribe(() => { });
    }
  }

  onClickDelete(): void {
    if (this.project) {
      this.projectService.fetDeleteById(this.project?.id).pipe(take(1)).subscribe(() => {
        this.router.navigate(['/main']);
      });
    }
  }

  onClickEdit(): void {
    this.projectService.setDisplayEditProject(true);
  }

  isDragging: boolean = false;

  private handleFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      if (this.project) {
        const createFile: CreateFileModel = {
          idProjects: this.project.id,
          file: base64,
          name: file.name
        }
        this.projectService.fetchUpdateBackProjectPersonalized(createFile).pipe(take(1)).subscribe(() => { });
      };
    }

    reader.onerror = (error) => {
      console.error('Erreur de lecture du fichier :', error);
    };

    reader.readAsDataURL(file);
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
