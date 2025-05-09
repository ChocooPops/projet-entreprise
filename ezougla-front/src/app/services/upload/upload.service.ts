import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) { }

  getUploadFile(imagePath: string): Observable<Blob> {
    const url = `${environment.apiUrl}/${imagePath}`;
    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }

  getOpenFile(file: string): Observable<Blob> {
    const url = `${environment.apiUrl}/${file}`;
    return this.http.get(url, { responseType: 'blob' });
  }

}
