import {APP_INITIALIZER, Injectable, Provider} from '@angular/core';
import {Observable, of, OperatorFunction, ReplaySubject, throwError} from 'rxjs';
import {delay, filter, first, map, shareReplay, skip, switchMap, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';

interface RawAuthInfo {
  authToken: string;
  refreshToken: string;
  // access_token: string;
  // expires_in: number;
  // first_name: string;
  // id: number;
  // jti: string;
  // last_name?: string;
  // refresh_token: string;
  // scope: string;
  // token_type: string;
}

interface DecodedAccessToken {
  authorities: string[];
  sub: string;
  role: number;
  exp: number;
}

export interface UserAuthInfo {
  username: string;
  roleId: number;
// permissions: Set<string>;
  accessToken: string;
  // authToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private readonly _auth$ = new ReplaySubject<RawAuthInfo | undefined | null>(1);

  public readonly auth$: Observable<UserAuthInfo | undefined | null> = this._auth$.pipe(
    map(auth => {
        if (auth == undefined) {
          return undefined;
        }
        const accessToken = jwt_decode(auth.authToken) as DecodedAccessToken;
        // const accessToken = jwt_decode(auth.access_token) as DecodedAccessToken;
        return {
          username: accessToken.sub,
          roleId: accessToken.role,
          // permissions: new Set(accessToken.authorities),
          accessToken: auth.authToken,
          refreshToken: auth.refreshToken
          // refreshToken: auth.refresh_token
        };
      }
    ),
    shareReplay(1)
  );

  constructor(private httpClient: HttpClient) {
    const currentAuthJson = localStorage.getItem('auth');
    const currentAuth = currentAuthJson !== null ? JSON.parse(currentAuthJson) as RawAuthInfo : undefined;
    this._auth$.next(currentAuth);

    this._auth$.pipe(skip(1)).subscribe(auth => {
      if (auth == undefined) {
        localStorage.removeItem('auth');
      } else {
        localStorage.setItem('auth', JSON.stringify(auth));
      }
    });
  }

  authenticate(username: string, password: string): Observable<UserAuthInfo> {
    const options = {
      headers: new HttpHeaders({
        Authorization: `Basic ${btoa('main-client:secret')}`
      })
    };
    // const request = new FormData();
    // request.append('grant_type', 'password');
    // request.append('scope', 'write');
    // request.append('login', username);
    // request.append('password', password);
    return this.httpClient.post<RawAuthInfo>('/restaurant/login', JSON.stringify({login: username, password: password}), options).pipe(
      tap(auth => {
        this._auth$.next(auth);
      }),
      switchMap(() => this.auth$.pipe(filter(auth => auth != undefined), first()))
    ) as Observable<UserAuthInfo>;
  }

  logout() {
    this._auth$.next(undefined);
  }

  refreshTokens(refreshToken: string): Observable<RawAuthInfo> {
    return this.auth$.pipe(
      first(),
      switchMap(auth => {
        if (auth == undefined) {
          return throwError(Error('can not refresh without tokens'));
        }
        const options = {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + refreshToken
          })
        };
        // const request = new FormData();
        // request.append('grant_type', 'password');
        // request.append('scope', 'write');
        // request.append('refresh_token', auth.refreshToken);
        return this.httpClient.post<RawAuthInfo>('/restaurant/refresh', null, options)
          .pipe(tap(refreshed => {
            this._auth$.next(refreshed);
          }));
      })
    );
  }
}

export function authInitializer(
  currentUserService: CurrentUserService
): () => Promise<UserAuthInfo | undefined | null> {
  return () => currentUserService.auth$.pipe(first()).toPromise();
}

export const AUTH_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: authInitializer,
  deps: [CurrentUserService],
  multi: true
};