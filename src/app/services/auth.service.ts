import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  private apiUrl = environment.apiUrl;

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Iniciar sesión - Llama al backend
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          // Guardar el token JWT
          localStorage.setItem('authToken', response.token);
          
          // Guardar información del usuario
          const user: User = {
            username: response.username,
            email: response.email,
            role: response.role
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Ocurrió un error desconocido';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
          } else {
            errorMessage = error.error?.error || error.error?.message || `Error ${error.status}: ${error.message}`;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Registrar nuevo usuario (Rol USER)
   */
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Error al registrar usuario';
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Crear nuevo administrador (Solo para ADMIN)
   */
  createAdmin(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/create-admin`, user)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Error al crear administrador';
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return this.currentUserValue !== null && token !== null;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  /**
   * Obtener el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
