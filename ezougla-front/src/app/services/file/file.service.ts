import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { map, Observable } from 'rxjs';
import { FileModel } from '../../model/file.interface';
import { CreateFileModel } from '../../model/create-file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly apiUrlGetFile: string = `${environment.apiUrl}/${environment.apiUrlFile}/${environment.apiUrlGetFileByProject}`;
  private readonly apiUrlCreateFileInProject: string = `${environment.apiUrl}/${environment.apiUrlFile}/${environment.apiUrlCreateFileInProject}`;
  private readonly apiUrlDeleteFile : string = `${environment.apiUrl}/${environment.apiUrlFile}`;

  constructor(private http: HttpClient) { }

  fetchGetFileByProject(idProject: string): Observable<FileModel[]> {
    return this.http.get<any[]>(`${this.apiUrlGetFile}/${idProject}`).pipe(
      map((data: FileModel[]) => {
        return data;
      })
    )
  }

  fetchCreateFileInProject(createFile : CreateFileModel) : Observable<FileModel> {
    return this.http.post<any>(this.apiUrlCreateFileInProject, createFile).pipe(
      map((data : FileModel) => {
        return data;
      })
    )
  }

  fetchDeleteFile(idFile : string) : Observable<FileModel> {
    return this.http.delete<any>(`${this.apiUrlDeleteFile}/${idFile}`).pipe(
      map((data : FileModel) => {
        return data;
      })
    )
  }

  fetchApercu() : void {

  }

  fetchDownloadFile() : void {

  }
}
