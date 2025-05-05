import { Injectable } from '@angular/core';
import { environment } from '../../../environnments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TaskModel } from '../../model/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly apiUrlGetTaskByProject: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlGetTaskByProject}`

  constructor(private http: HttpClient) { }

  fetchTasksByProject(idProject: string): Observable<TaskModel[]> {
    return this.http.get<any>(`${this.apiUrlGetTaskByProject}/${idProject}`).pipe(
      map((data: TaskModel[]) => {
        return data;
      })
    )
  }

}
