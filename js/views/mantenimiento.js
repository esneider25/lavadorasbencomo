// import { mantenimientoService } from '../services/mantenimientoService.js';

export async function init(db) {
  const contentDiv = document.getElementById('mantenimiento-content');
  
  contentDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid fa-wrench"></i></div>
      <h3 class="empty-state-title">Módulo de Mantenimiento</h3>
      <p class="empty-state-text">Aquí podrás ver el historial de reparaciones y mantenimientos pendientes.</p>
    </div>
  `;
}
