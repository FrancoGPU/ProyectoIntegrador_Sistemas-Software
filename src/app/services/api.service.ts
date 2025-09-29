import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * GET request genérico
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        finalize(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * POST request genérico
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        finalize(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PUT request genérico
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        finalize(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PATCH request genérico
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        finalize(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * DELETE request genérico
   */
  delete<T>(endpoint: string): Observable<T> {
    this.setLoading(true);
    
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`)
      .pipe(
        finalize(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse) {
    this.setLoading(false);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Controla el estado de loading
   */
  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  /**
   * Obtener URL base
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}