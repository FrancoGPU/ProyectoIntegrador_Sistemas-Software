import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-producto",
  template:  `
      <div class="div-container">
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
        <div class="div-content">
          <h1>Ordenador ASUS</h1>
          <div class="img-container">
          <img src="https://www.bing.com/th?id=OPHS.qK7bm%2B3ugD3IUA474C474&o=5&pid=21.1&h=140&qlt=100&dpr=1&o=2&w=117">
          </div>
          <p>El producto es un ordenador ASUS.</p>
          <p>Marca: ASUS</p>
          <strong>Precio: S/.3500</strong>
        </div>
      </div>
  `,
  styles: [`
        .div-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .div-content {
          border: 1px solid #ccc;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background-color: #f9f9f9;
        }
        .img-container {
          display: flex;
          justify-content: center;
        }
        .div-content img {
          max-width: 100%;
          height: auto;
          display: flex;
          justify-content: center;
        }
        h1 {
          color: #2c3e50; 
          font-family: Arial, sans-serif;
          font-size: 24px;
          text-align: center;
        }
        p {
          font-size: 16px;
        }
        strong {
          color: red;
        }
      `],
})
export class ProductoComponent {
  // Aquí puedes definir las propiedades y métodos de tu componente
}