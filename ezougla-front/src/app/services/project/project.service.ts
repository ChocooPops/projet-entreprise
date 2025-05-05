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

  private projectsSubject : BehaviorSubject<ProjectModel[]> = new BehaviorSubject<ProjectModel[]>([]);
  private project$ : Observable<ProjectModel[]> = this.projectsSubject.asObservable();


  constructor(private http: HttpClient) { 
    this.fetchAllProjectByUser().subscribe(() => {

    })
  }

  fetchAllProjectByUser(): Observable<void> {
    if(this.projectsSubject.value.length < 1) {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(environment.access_token)}`
      };
      return this.http.get<any[]>(`${this.apiUrlGetProject}`, { headers }).pipe(
        map((data: any[]) => {
          const projects : ProjectModel[] = [];
          data.forEach((project : any) => {
            projects.push( {
              id : project.id,
              name : project.name,
              desciption : project.desciption,
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
    const headers = {
      Authorization: `Bearer ${localStorage.getItem(environment.access_token)}`
    };
  
    return this.http.post<any>(
      this.apiUrlCreateHollowProject,
      {}, // <- corps vide (pas de body à envoyer ici)
      { headers } // <- headers dans un objet options ici
    ).pipe(
      map((data: any) => {
        console.log(data);
        const projects: ProjectModel[] = this.projectsSubject.value;
        projects.push({
          id: data.id,
          name: data.name,
          desciption: data.desciption
        });
        this.projectsSubject.next(projects);
      })
    );
  }

  getAllProjectsByUser() : Observable<ProjectModel[]> {
    return this.project$;
  }


}
