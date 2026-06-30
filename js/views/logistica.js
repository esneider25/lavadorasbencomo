// import { logisticaService } from '../services/logisticaService.js';

export async function init(db) {
  const contentDiv = document.getElementById('logistica-content');
  
  contentDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid fa-truck"></i></div>
      <h3 class="empty-state-title">Módulo de Logística</h3>
      <p class="empty-state-text">Aquí gestionarás las rutas de entrega y recogida de equipos.</p>
    </div>
  `;
}
