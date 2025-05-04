import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrlGetProject: string = `${environment.apiUrl}/${environment.apiUrlProject}`

  constructor(private http: HttpClient) { }

  fetchAllProjectByUser(): Observable<void> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`
    };
    console.log(headers)
    return this.http.get<any>(`${this.apiUrlGetProject}`, { headers }).pipe(
      map((data: any) => {
        console.log(data);
      })
    );
  }


}
