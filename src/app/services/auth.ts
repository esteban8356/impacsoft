import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, map, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private modulesKey = 'auth_modules';
  private roleKey = 'auth_role';
  private usernameKey = 'auth_username';


  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: any): Observable<any> {
    return this.http.post<{ username: string, role: string, allowedModules: string[] }>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            // We only store non-sensitive info in localStorage for UI convenience if needed, 
            // but the source of truth is the cookie.
            localStorage.setItem(this.modulesKey, JSON.stringify(response.allowedModules));
            localStorage.setItem(this.roleKey, response.role);
            localStorage.setItem(this.usernameKey, response.username);
          }
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.modulesKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
    }
    this.router.navigate(['/login']);
  }

  // New method to verify session existence
  verifySession(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/verify`, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.valid) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.modulesKey, JSON.stringify(response.allowedModules));
            localStorage.setItem(this.roleKey, response.role);
            localStorage.setItem(this.usernameKey, response.username);
          }
        }
      }),
      map(() => true),
      catchError(() => {
        this.logoutClientSide();
        return of(false);
      })
    );
  }

  private logoutClientSide(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.modulesKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
    }
  }

  // Deprecated or needs to be async. For synchronous checks (e.g. initial template rendering)
  // we might still rely on the presence of user info in localStorage, but strictly speaking
  // we should trust the cookie. 
  // For guards, we will use verifySession.
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Fallback: check if we have user data. 
      // Real validation happens via verifySession in the guard or app init.
      return !!localStorage.getItem(this.usernameKey);
    }
    return false;
  }

  hasAccess(moduleName: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const modules = JSON.parse(localStorage.getItem(this.modulesKey) || '[]');
      return modules.includes(moduleName);
    }
    return false;
  }

  getUsername(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.usernameKey) || 'Usuario';
    }
    return 'Usuario';
  }
}
