import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { ProjectModel } from '../../model/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrlGetProject: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlFindManyProjects}`
  private apiUrlCreateHollowProject: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlCreateProject}`
  private apiUrlUpdateName: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectName}`
  private apiUrlUpdateDescription: string = `${environment.apiUrl}/${environment.apiUrlProject}/${environment.apiUrlUpdateProjectDescription}`
  private apiUrlDelete: string = `${environment.apiUrl}/${environment.apiUrlProject}`

  private projectsSubject: BehaviorSubject<ProjectModel[]> = new BehaviorSubject<ProjectModel[]>([]);
  private project$: Observable<ProjectModel[]> = this.projectsSubject.asObservable();

  private projectClickedSubject : BehaviorSubject<string> = new BehaviorSubject<string>('');
  private projectClicked$ : Observable<string> = this.projectClickedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchAllProjectByUser().subscribe(() => {
    })
  }

  getPorjectClicked() : Observable<string> {
    return this.projectClicked$;
  }

  setProjectClicked(id : string) : void {
    this.projectClickedSubject.next(id);
  }

  fetchAllProjectByUser(): Observable<void> {
    if (this.projectsSubject.value.length < 1) {
      return this.http.get<any[]>(`${this.apiUrlGetProject}`).pipe(
        map((data: any[]) => {
          const projects: ProjectModel[] = [];
          data.forEach((project: any) => {
            projects.push({
              id: project.id,
              name: project.name,
              description: project.description,
              srcBackground: `${environment.apiUrl}/${project.srcBackground}`
            })
          })
          this.projectsSubject.next(projects);
          return;
        })
      );
    } else {
      return of()
    }
  }

  fetchCreateProject(): Observable<void> {
    return this.http.post<any>(
      this.apiUrlCreateHollowProject, {}
    ).pipe(
      map((data: any) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        projects.push({
          id: data.id,
          name: data.name,
          description: data.description,
          srcBackground: `${environment.apiUrl}/${data.srcBackground}`
        });
        this.projectsSubject.next(projects);
      })
    );
  }

  fetchUpdatName(id: string, name: string): Observable<void> {
    return this.http.put<any>(`${this.apiUrlUpdateName}/${id}`, { name }).pipe(
      map((data: any) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === id);
        projects[index].name = data.name;
        this.projectsSubject.next(projects)
      })
    )
  }

  fetchUpdatDescription(id: string, description: string): Observable<void> {
    return this.http.put<any>(`${this.apiUrlUpdateDescription}/${id}`, { description }).pipe(
      map((data: any) => {
        const projects: ProjectModel[] = this.projectsSubject.value;
        const index: number = projects.findIndex(item => item.id === id);
        projects[index].description = data.description;
        this.projectsSubject.next(projects)
      })
    )
  }

  getAllProjectsByUser(): Observable<ProjectModel[]> {
    return this.project$;
  }

  fetDeleteById(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrlDelete}/${id}`).pipe(
      map((data: any) => {
        let projects: ProjectModel[] = this.projectsSubject.value;
        projects = projects.filter(item => item.id !== id);
        this.projectsSubject.next(projects);
      })
    )
  }

}
