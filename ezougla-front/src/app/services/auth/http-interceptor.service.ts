import { Injectable } from "@angular/core";
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environnments/environments";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem(environment.access_token);
        if (token) {
            const cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(cloned);
        }
        return next.handle(req);
    }
}
