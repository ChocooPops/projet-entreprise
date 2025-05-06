import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl : string = `${environment.apiUrl}`;

  constructor(private http : HttpClient) { }

  getUploadFile(imagePath: string): Observable<Blob> {
    const url = `${environment.apiUrl}/${imagePath}`;
    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }

}
