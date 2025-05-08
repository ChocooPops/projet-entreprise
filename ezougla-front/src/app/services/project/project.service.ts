import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { BehaviorSubject, map, Observable, of, take, switchMap, forkJoin, tap } from 'rxjs';
import { ProjectModel } from '../../model/project.interface';
import { ProfilePhotoModel } from '../../model/profil-photo.interface';
import { UploadService } from '../upload/upload.service';
import { CreateFileModel } from '../../model/create-file.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrlGetProject: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlFindManyProjects}`;
  private apiUrlCreateHollowProject: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlCreateProject}`;
  private apiUrlUpdateName: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectName}`;
  private apiUrlUpdateDescription: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectDescription}`;
  private apiUrlDelete: string = `${environment.apiUrl}/${environment.apiUrlProject}`;
  private apiUrlUpdateBack: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectBack}`;
  private apiUrlUpdateBackPersonalized: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectBackPersonalized}`;
  private apiUrlAssignedUser: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlAssignedUser}`;
  private apiUrlUnassignedUser: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUnassignedUser}`;

  private projectsSubject: BehaviorSubject<ProjectModel[]> = new BehaviorSubject<ProjectModel[]>([]);
  private project$: Observable<ProjectModel[]> = this.projectsSubject.asObservable();

  private projectClickedSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private projectClicked$: Observable<string> = this.projectClickedSubject.asObservable();

  private displayEditProjectSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private displayEditProject$: Observable<boolean> = this.displayEditProjectSubject.asObservable();

  constructor(private http: HttpClient,
    private uploadService: UploadService
  ) {
  }

  getPorjectClicked(): Observable<string> {
    return this.projectClicked$;
  }

  setProjectClicked(id: string): void {
    this.projectClickedSubject.next(id);
  }

  fetchAllProjectByUser(): Observable<void> {
    if (this.projectsSubject.value.length < 1) {
      return this.http.get<ProjectModel[]>(`${this.apiUrlGetProject}`).pipe(
        switchMap((projects: ProjectModel[]) => {
          const requests = projects.map(project =>
            this.uploadService.getUploadFile(project.srcBackground).pipe(
              map((blob: Blob): ProjectModel => ({
                ...project,
                srcBackground: URL.createObjectURL(blob)
              }))
            )
          );
          return forkJoin(requests);
        }),
        tap((projectsWithUrl: ProjectModel[]) => {
          this.projectsSubject.next(projectsWithUrl);
        }),
        map(() => void 0)
      );
    } else {
      return of();
    }
  }

  fetchCreateProject(): Observable<void> {
    return this.http.post<ProjectModel>(this.apiUrlCreateHollowProject, {}).pipe(
      switchMap((project: any) =>
        this.uploadService.getUploadFile(project.srcBackground).pipe(
          map((blob: Blob) => {
            console.log(project);
            const blobUrl = URL.createObjectURL(blob);
            project.srcBackground = blobUrl;

            const projects: ProjectModel[] = this.projectsSubject.value;
            projects.push(project);
            this.projectsSubject.next(projects);
          })
        )
      )
    );
  }

  fetchUpdatName(id: string, name: string): Observable<void> {
    return this.http.put<any>(`${this.apiUrlUpdateName}/${id}`, { name }).pipe(
      map((data: ProjectModel) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === id);
        projects[index].name = data.name;
        this.projectsSubject.next(projects);
      })
    )
  }

  fetchUpdatDescription(id: string, description: string): Observable<void> {
    return this.http.put<any>(`${this.apiUrlUpdateDescription}/${id}`, { description }).pipe(
      map((data: ProjectModel) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === id);
        projects[index].description = data.description;
        this.projectsSubject.next(projects);
      })
    )
  }

  getAllProjectsByUser(): Observable<ProjectModel[]> {
    return this.project$;
  }

  fetDeleteById(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrlDelete}/${id}`).pipe(
      map((data: ProjectModel) => {
        let projects: ProjectModel[] = this.projectsSubject.value;
        projects = projects.filter(item => item.id !== data.id);
        this.projectsSubject.next(projects);
      })
    )
  }

  private urlProjectPhotoBack: string = `uploads/projects`;

  private photos: string[] = [
    'back-1.jpg',
    'back-2.jpg',
    'back-3.jpg',
    'back-4.jpg',
    'back-5.jpg',
    'back-6.jpg',
    'back-7.jpg',
    'back-8.jpg',
    'back-9.jpg',
    'back-10.jpg',
    'back-11.jpg',
    'back-12.jpg',
    'back-13.jpg',
  ]

  private backgroundPhoto: ProfilePhotoModel[] = [];

  public fillBackgroundPhotoProject(): void {
    if (this.backgroundPhoto.length < 1) {
      for (const photo of this.photos) {
        const url: string = `${this.urlProjectPhotoBack}/${photo}`;
        this.uploadService.getUploadFile(url).pipe(take(1)).subscribe((blob: Blob) => {
          this.backgroundPhoto.push({ photo: url, blob: URL.createObjectURL(blob) });
        })
      }
    }
  }

  public fetchUpdateBackProject(photo: ProfilePhotoModel): Observable<any> {
    const url: string = photo.photo;
    return this.http.put<ProjectModel>(`${this.apiUrlUpdateBack}/${this.projectClickedSubject.value}`, { url }).pipe(
      switchMap((data: ProjectModel) =>
        this.uploadService.getUploadFile(data.srcBackground).pipe(
          map((blob: Blob) => {
            const blobUrl = URL.createObjectURL(blob);
            const projects: ProjectModel[] = this.projectsSubject.value;
            const index: number = projects.findIndex(item => item.id === data.id);
            projects[index].srcBackground = blobUrl;
            this.projectsSubject.next(projects);
          })
        )
      )
    );
  }

  public fetchUpdateBackProjectPersonalized(file: CreateFileModel): Observable<any> {
    return this.http.put<ProjectModel>(`${this.apiUrlUpdateBackPersonalized}`, file).pipe(
      switchMap((data: ProjectModel) =>
        this.uploadService.getUploadFile(data.srcBackground).pipe(
          map((blob: Blob) => {
            const blobUrl = URL.createObjectURL(blob);
            const projects: ProjectModel[] = this.projectsSubject.value;
            const index: number = projects.findIndex(item => item.id === data.id);
            projects[index].srcBackground = blobUrl;
            this.projectsSubject.next(projects);
          })
        )
      )
    );
  }

  getBackgroundPhotoProject(): ProfilePhotoModel[] {
    return this.backgroundPhoto;
  }

  public setDisplayEditProject(state: boolean): void {
    this.displayEditProjectSubject.next(state);
  }

  public getDisplayEditProject(): Observable<boolean> {
    return this.displayEditProject$;
  }

  public resetProjects(): void {
    this.projectsSubject.next([])
  }

  public fetchAssignedUserIntoProjectById(userId: string, projectId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrlAssignedUser}/${userId}/${projectId}`, {}).pipe(
      map((data: ProjectModel) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === data.id);
        projects[index].assignedUsers = data.assignedUsers;
        this.projectsSubject.next(projects);
      })
    )
  }
  public fetchUnassignedUserIntoProjectById(userId: string, projectId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrlUnassignedUser}/${userId}/${projectId}`, {}).pipe(
      map((data: ProjectModel) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === data.id);
        projects[index].assignedUsers = data.assignedUsers;
        this.projectsSubject.next(projects);
      })
    )
  }

}
