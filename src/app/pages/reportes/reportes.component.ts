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
