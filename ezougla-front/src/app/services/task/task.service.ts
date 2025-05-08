import { Injectable } from '@angular/core';
import { environment } from '../../../environnments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TaskModel } from '../../model/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly apiUrlGetTaskByProject: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlGetTaskByProject}`;
  private readonly urlCreateTask: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlCreateTask}`;
  private readonly urlUpdateTitle: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlUpdateTitleTask}`;
  private readonly urlUpdateDescription: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlUpdateDescriptionTask}`;
  private readonly urlUpdateStatus: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlUpdateStatusTask}`;
  private readonly urlAddUserToTask: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlAddUserToTask}`;
  private readonly urlRemoveUserToTask: string = `${environment.apiUrl}/${environment.apiUrlTask}/${environment.apiUrlRemoveUserToTask}`;
  private readonly urlDeleteTask: string = `${environment.apiUrl}/${environment.apiUrlTask}`;

  constructor(private http: HttpClient) { }

  fetchTasksByProject(idProject: string): Observable<TaskModel[]> {
    return this.http.get<any>(`${this.apiUrlGetTaskByProject}/${idProject}`).pipe(
      map((data: TaskModel[]) => {
        return data;
      })
    )
  }

  fetchCreateEmptyTask(projectId: string): Observable<TaskModel> {
    return this.http.post<any>(`${this.urlCreateTask}/${projectId}`, {}).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }

  fetchUpdateTitleTask(taskId: string, title: string): Observable<TaskModel> {
    return this.http.put<any>(`${this.urlUpdateTitle}/${taskId}`, { title }).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }
  fetchUpdateDescriptionTask(taskId: string, description: string): Observable<TaskModel> {
    return this.http.put<any>(`${this.urlUpdateDescription}/${taskId}`, { description }).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }
  fetchUpdateStatusTask(taskId: string, status: string): Observable<TaskModel> {
    return this.http.put<any>(`${this.urlUpdateStatus}/${taskId}`, { status }).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }

  fetchAssignedNewUserToTask(taskId: string, userId: string): Observable<TaskModel> {
    return this.http.put<any>(`${this.urlAddUserToTask}/${taskId}/${userId}`, {}).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }

  fetchUnassignedUserToTask(taskId: string, userId: string): Observable<TaskModel> {
    return this.http.put<any>(`${this.urlRemoveUserToTask}/${taskId}/${userId}`, {}).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }

  fetchDeleteTaskById(taskId: string): Observable<TaskModel> {
    return this.http.delete<any>(`${this.urlDeleteTask}/${taskId}`).pipe(
      map((data: TaskModel) => {
        return data;
      })
    )
  }



}
