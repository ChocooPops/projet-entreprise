import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { map, Observable } from 'rxjs';
import { FileModel } from '../../model/file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly apiUrlGetFile: string = `${environment.apiUrl}/${environment.apiUrlFile}/${environment.apiUrlGetFileByProject}`;

  constructor(private http: HttpClient) { }

  fetchGetFileByProject(idProject: string): Observable<FileModel[]> {
    return this.http.get<any[]>(`${this.apiUrlGetFile}/${idProject}`).pipe(
      map((data: FileModel[]) => {
        return data;
      })
    )
  }
}
