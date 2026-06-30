// import { gastosService } from '../services/gastosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('gastos-content');
  
  contentDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid fa-receipt"></i></div>
      <h3 class="empty-state-title">Módulo de Gastos</h3>
      <p class="empty-state-text">Aquí podrás registrar egresos como repuestos, gasolina o mantenimiento.</p>
    </div>
  `;
}
