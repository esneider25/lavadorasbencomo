// import { pagosService } from '../services/pagosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('finanzas-content');
  
  contentDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid fa-wallet"></i></div>
      <h3 class="empty-state-title">Módulo de Finanzas</h3>
      <p class="empty-state-text">Aquí podrás ver el balance de ingresos, métodos de pago y cierres de caja.</p>
    </div>
  `;
}
