import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {

  constructor(private apiService: ApiService) {}

  downloadPdf() {
    console.log('Iniciando descarga de PDF...');
    this.apiService.download('reports/inventory/pdf').subscribe({
      next: (blob: Blob) => {
        console.log('PDF recibido, tamaño:', blob.size, 'tipo:', blob.type);
        this.downloadFile(blob, 'inventario.pdf');
      },
      error: (err) => console.error('Error descargando PDF', err)
    });
  }

  downloadExcel() {
    console.log('Iniciando descarga de Excel...');
    this.apiService.download('reports/inventory/excel').subscribe({
      next: (blob: Blob) => {
        console.log('Excel recibido, tamaño:', blob.size, 'tipo:', blob.type);
        this.downloadFile(blob, 'inventario.xlsx');
      },
      error: (err) => console.error('Error descargando Excel', err)
    });
  }

  downloadRoutesPdf() {
    console.log('Iniciando descarga de PDF de Rutas...');
    this.apiService.download('reports/routes/pdf').subscribe({
      next: (blob: Blob) => {
        console.log('PDF recibido, tamaño:', blob.size, 'tipo:', blob.type);
        this.downloadFile(blob, 'rutas.pdf');
      },
      error: (err) => console.error('Error descargando PDF de Rutas', err)
    });
  }

  downloadRoutesExcel() {
    console.log('Iniciando descarga de Excel de Rutas...');
    this.apiService.download('reports/routes/excel').subscribe({
      next: (blob: Blob) => {
        console.log('Excel recibido, tamaño:', blob.size, 'tipo:', blob.type);
        this.downloadFile(blob, 'rutas.xlsx');
      },
      error: (err) => console.error('Error descargando Excel de Rutas', err)
    });
  }

  // --- CLIENTES ---
  downloadClientsPdf() {
    console.log('Iniciando descarga de PDF de Clientes...');
    this.apiService.download('reports/clients/pdf').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'clientes.pdf');
      },
      error: (err) => console.error('Error descargando PDF de Clientes', err)
    });
  }

  downloadClientsExcel() {
    console.log('Iniciando descarga de Excel de Clientes...');
    this.apiService.download('reports/clients/excel').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'clientes.xlsx');
      },
      error: (err) => console.error('Error descargando Excel de Clientes', err)
    });
  }

  // --- PROVEEDORES ---
  downloadSuppliersPdf() {
    console.log('Iniciando descarga de PDF de Proveedores...');
    this.apiService.download('reports/suppliers/pdf').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'proveedores.pdf');
      },
      error: (err) => console.error('Error descargando PDF de Proveedores', err)
    });
  }

  downloadSuppliersExcel() {
    console.log('Iniciando descarga de Excel de Proveedores...');
    this.apiService.download('reports/suppliers/excel').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'proveedores.xlsx');
      },
      error: (err) => console.error('Error descargando Excel de Proveedores', err)
    });
  }

  // --- PEDIDOS ---
  downloadOrdersPdf() {
    console.log('Iniciando descarga de PDF de Pedidos...');
    this.apiService.download('reports/orders/pdf').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'pedidos.pdf');
      },
      error: (err) => console.error('Error descargando PDF de Pedidos', err)
    });
  }

  downloadOrdersExcel() {
    console.log('Iniciando descarga de Excel de Pedidos...');
    this.apiService.download('reports/orders/excel').subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'pedidos.xlsx');
      },
      error: (err) => console.error('Error descargando Excel de Pedidos', err)
    });
  }

  private downloadFile(blob: Blob, fileName: string) {
    if (blob.size === 0) {
      console.error('El archivo descargado está vacío.');
      return;
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Retrasar la revocación para asegurar que la descarga inicie
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  }
}
