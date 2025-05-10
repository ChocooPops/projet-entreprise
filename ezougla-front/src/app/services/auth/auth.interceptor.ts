import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environnments/environments';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.headers.has('skipInterceptor')) {
    const headers = req.headers.delete('skipInterceptor');
    const cloned = req.clone({ headers });
    return next(cloned);
  }

  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(environment.access_token);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};