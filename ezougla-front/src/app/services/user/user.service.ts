import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { RegisterModel } from '../../model/register.interface';
import { BehaviorSubject, catchError, map, Observable, of, take, switchMap, forkJoin, tap } from 'rxjs';
import { MessageModel } from '../../model/message.interface';
import { UserModel } from '../../model/user.interface';
import { UploadService } from '../upload/upload.service';
import { ProfilePhotoModel } from '../../model/profil-photo.interface';
import { CreateFileModel } from '../../model/create-file.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
    private uploadService: UploadService
  ) {
  }

  public setUser(): void {
    this.fetchGetUserConnected().subscribe((user: UserModel) => {
      this.uploadService.getUploadFile(user.profilePhoto).subscribe((blob: Blob) => {
        this.setUserProfilPhoto(blob);
      })
    });
  }

  private readonly apiUrlRegister: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlRegister}`;
  private readonly apiUrlGetUser: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlFindUser}`;
  private urlProfilPhoto: string = `uploads/user`;
  private urlProfiChangePhoto: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlUserChangePhoto}`;
  private urlProfiChangePhotoPerso: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlUserChangePhotoPerso}`;
  private urlGetAllUsers: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlGetAllUsers}`;
  private urlDeleteUser: string = `${environment.apiUrl}/${environment.apiUrlUser}`;
  private urlEnableUser: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlUserEnable}`;
  private urlDisableUser: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlUserDisable}`;
  private urlModifyRoleUser: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlUserModifyRole}`;

  private userSubject: BehaviorSubject<UserModel | undefined> = new BehaviorSubject<UserModel | undefined>(undefined);
  private user$: Observable<UserModel | undefined> = this.userSubject.asObservable();

  private photos: string[] = [
    'user-1.png',
    'user-2.png',
    'user-3.png',
    'user-4.png',
    'user-5.png',
    'user-6.png',
    'user-7.png',
    'user-8.png',
    'user-9.png',
    'user-10.png'
  ]

  private profilePhotos: ProfilePhotoModel[] = [];

  public fetchRegister(register: RegisterModel): Observable<MessageModel> {
    return this.http.post<any>(`${this.apiUrlRegister}`, register).pipe(
      map((data: MessageModel) => {
        return data
      }),
      catchError((error) => {
        return of(
          { message: 'Connection impossible avec le serveur' }
        )
      })
    )
  }

  public fetchGetUserConnected(): Observable<UserModel> {
    return this.http.get<any>(this.apiUrlGetUser).pipe(
      map((data: any) => {
        const user: UserModel = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
          profilePhoto: data.profilePhoto,
        };
        this.userSubject.next(user);
        return user;
      })
    );
  }

  public getUserSubject(): Observable<UserModel | undefined> {
    return this.user$;
  }

  public setUserProfilPhoto(pp: Blob): void {
    const user: UserModel | undefined = this.userSubject.value;
    if (user) {
      user.profilePhoto = URL.createObjectURL(pp);
      this.userSubject.next(user);

      const userTab: UserModel[] = this.userTabSubject.value;
      const index: number = userTab.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        userTab[index].profilePhoto = URL.createObjectURL(pp);
        this.userTabSubject.next(userTab);
      }
    }
  }

  public fillProfilPhotoBold(): void {
    if (this.profilePhotos.length < 1) {
      for (const photo of this.photos) {
        const url: string = `${this.urlProfilPhoto}/${photo}`;
        this.uploadService.getUploadFile(url).pipe(take(1)).subscribe((blob: Blob) => {
          this.profilePhotos.push({ photo: url, blob: URL.createObjectURL(blob) });
        })
      }
    }
  }

  public getProfilPhotoBlob(): ProfilePhotoModel[] {
    return this.profilePhotos;
  }

  public fetchChangeProfilPhoto(photo: ProfilePhotoModel): Observable<any> {
    const url: string = photo.photo;
    return this.http.put<any>(this.urlProfiChangePhoto, { url }).pipe(
      map((data: UserModel) => {
        this.uploadService.getUploadFile(data.profilePhoto).subscribe((blob: Blob) => {
          this.setUserProfilPhoto(blob);
        })
      })
    )
  }

  public fetchChangeProfilPhotoPersonalized(file: CreateFileModel): Observable<any> {
    return this.http.put<any>(this.urlProfiChangePhotoPerso, file).pipe(
      map((data: UserModel) => {
        this.uploadService.getUploadFile(data.profilePhoto).subscribe((blob: Blob) => {
          this.setUserProfilPhoto(blob);
        })
      })
    )
  }

  private displayEditUserSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private displayEditUser$: Observable<boolean> = this.displayEditUserSubject.asObservable();

  public setDisplayEditUser(state: boolean): void {
    this.displayEditUserSubject.next(state);
  }

  public getDisplayEditUser(): Observable<boolean> {
    return this.displayEditUser$;
  }

  public resetUser(): void {
    this.userSubject.next(undefined);
  }


  private userTabSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  public userTab$: Observable<UserModel[]> = this.userTabSubject.asObservable();

  getUserTab(): Observable<UserModel[]> {
    return this.userTab$;
  }

  fetchAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.urlGetAllUsers).pipe(
      switchMap((users: UserModel[]) => {
        const usersWithBlobs$ = users.map(user =>
          this.uploadService.getUploadFile(user.profilePhoto).pipe(
            map((blob: Blob) => {
              const blobUrl = URL.createObjectURL(blob);
              return { ...user, profilePhoto: blobUrl } as UserModel;
            })
          )
        );
        return forkJoin(usersWithBlobs$);
      }),
      tap(users => this.userTabSubject.next(users))
    );
  }

  fetchDeleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlDeleteUser}/${id}`).pipe(
      map((data: UserModel) => {
        let users: UserModel[] = this.userTabSubject.value;
        users = users.filter((item) => item.id !== data.id);
        this.userTabSubject.next(users);
      })
    )
  }
  fetchModifyRoleUser(id: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.urlModifyRoleUser}/${id}`, { role }).pipe(
      map((data: UserModel) => {
        const users: UserModel[] = this.userTabSubject.value;
        const index: number = users.findIndex((item) => item.id === data.id);
        users[index].role = data.role;
        this.userTabSubject.next(users);
      })
    )
  }
  fetchDisableUser(id: string): Observable<any> {
    return this.http.put<any>(`${this.urlDisableUser}/${id}`, {}).pipe(
      map((data: UserModel) => {
        const users: UserModel[] = this.userTabSubject.value;
        const index: number = users.findIndex((item) => item.id === data.id);
        users[index].role = data.role;
        this.userTabSubject.next(users);
      })
    )
  }
  fetchEnableUser(id: string): Observable<any> {
    return this.http.put<any>(`${this.urlEnableUser}/${id}`, {}).pipe(
      map((data: UserModel) => {
        const users: UserModel[] = this.userTabSubject.value;
        const index: number = users.findIndex((item) => item.id === data.id);
        users[index].role = data.role;
        this.userTabSubject.next(users);
      })
    )
  }

}
