import { Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { TOKEN_KEY } from './auth.service';

/**
 * This is the migrated file that replaces extended-http.service.ts
 */

@Injectable({
  providedIn: 'root'
})
export class HttpAuthInterceptorService implements HttpInterceptor {

  constructor(
    private storage: Storage,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return (
      from(this.storage.get(TOKEN_KEY))
        .pipe(
          switchMap(
            (token) => {
              if (!token) {
                return next.handle(req);
              }

              const request = req.clone({
                setHeaders: { Authorization: `Bearer ${ token }` }
              });

              /*if (!!(window as any).FirebasePlugin) {
                this.trackAppView(req.url);
              }*/

              return next.handle(request);
            }
          )
        )
    );
  }

  /**
   * Takes the url as the screen view name and sends it to Firebase Analytics
   * @param url The url object to track for Firebase Analytics
   */
  async trackAppView(url: string) {
    /*try {
      const response = await this.firebase.logEvent('page_view', { content_type: 'page_view', item_id: url });
      console.log('Tracking with Firebase Analytics: ', response);
    } catch (error) {
      console.error('Error with Firebase Analytics event log: ', error);
    }*/
  }

}
