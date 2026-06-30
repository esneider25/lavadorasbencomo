import { alquileresService } from '../services/alquileresService.js';

export async function init(db) {
  const contentDiv = document.getElementById('alquileres-content');
  
  contentDiv.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID / Lavadora</th>
            <th>Cliente</th>
            <th>Fecha Inicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="alquileres-tbody">
          <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('alquileres-tbody');

  try {
    const alquileres = await alquileresService.getAll();
    if (alquileres.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay alquileres</td></tr>';
      return;
    }

    tbody.innerHTML = alquileres.map(a => `
      <tr>
        <td class="text-mono">${a.id_lavadora}</td>
        <td>${a.clienteNombre || a.id_cliente}</td>
        <td>${new Date(a.fecha_inicio).toLocaleDateString()}</td>
        <td><span class="badge badge-${a.estado_alquiler === 'activo' ? 'success' : 'neutral'}"><div class="badge-dot"></div>${a.estado_alquiler}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error cargando alquileres:", error);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
  }
}
