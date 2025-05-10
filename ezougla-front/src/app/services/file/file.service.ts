import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { map, Observable } from 'rxjs';
import { FileModel } from '../../model/file.interface';
import { CreateFileModel } from '../../model/create-file.interface';
import { UploadService } from '../upload/upload.service';
import { ConversationService } from '../conversation/conversation.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly apiUrlGetFile: string = `${environment.apiUrl}/${environment.apiUrlFile}/${environment.apiUrlGetFileByProject}`;
  private readonly apiUrlCreateFileInProject: string = `${environment.apiUrl}/${environment.apiUrlFile}/${environment.apiUrlCreateFileInProject}`;
  private readonly apiUrlDeleteFile: string = `${environment.apiUrl}/${environment.apiUrlFile}`;

  constructor(private http: HttpClient,
    private uploadService: UploadService,
    private conversationService: ConversationService
  ) { }

  fetchGetFileByProject(idProject: string): Observable<FileModel[]> {
    return this.http.get<any[]>(`${this.apiUrlGetFile}/${idProject}`).pipe(
      map((data: FileModel[]) => {
        return data;
      })
    )
  }

  fetchCreateFileInProject(createFile: CreateFileModel): Observable<FileModel> {
    return this.http.post<any>(this.apiUrlCreateFileInProject, createFile).pipe(
      map((data: FileModel) => {
        return data;
      })
    )
  }

  fetchDeleteFile(idFile: string): Observable<FileModel> {
    return this.http.delete<any>(`${this.apiUrlDeleteFile}/${idFile}`).pipe(
      map((data: FileModel) => {
        this.conversationService.deleteMessagesByFileId(data.id)
        return data;
      })
    )
  }

  fetchApercu(path: string): void {
    this.uploadService.getUploadFile(path).subscribe((blob: Blob) => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    });
  }

  fetchDownloadFile(path: string, name: string): void {
    this.uploadService.getUploadFile(path).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
