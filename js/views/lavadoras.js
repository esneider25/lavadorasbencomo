import { lavadorasService } from '../services/lavadorasService.js';

export async function init(db) {
  const contentDiv = document.getElementById('lavadoras-content');
  
  contentDiv.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Modelo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="lavadoras-tbody">
          <tr><td colspan="3" style="text-align: center;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('lavadoras-tbody');

  try {
    const lavadoras = await lavadorasService.getAll();
    if (lavadoras.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay lavadoras registradas</td></tr>';
      return;
    }

    tbody.innerHTML = lavadoras.map(l => `
      <tr>
        <td class="text-mono">${l.serial}</td>
        <td>${l.modelo || 'N/A'}</td>
        <td><span class="badge badge-${l.estado_lavadora === 'disponible' ? 'success' : (l.estado_lavadora === 'alquilada' ? 'info' : 'warning')}"><div class="badge-dot"></div>${l.estado_lavadora}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error cargando lavadoras:", error);
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
  }
}
