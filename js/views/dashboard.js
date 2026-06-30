import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';

export async function init(db) {
  const contentDiv = document.getElementById('dashboard-content');
  
  contentDiv.innerHTML = `
    <div class="grid-stats">
      <div class="stat-card blue">
        <div class="stat-card-icon"><i class="fa-solid fa-file-contract"></i></div>
        <div class="stat-card-label">Alquileres Activos</div>
        <div class="stat-card-value" id="dash-alquileres">-</div>
      </div>
      <div class="stat-card green">
        <div class="stat-card-icon"><i class="fa-solid fa-users"></i></div>
        <div class="stat-card-label">Clientes Registrados</div>
        <div class="stat-card-value" id="dash-clientes">-</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-card-icon"><i class="fa-solid fa-jug-detergent"></i></div>
        <div class="stat-card-label">Lavadoras Disponibles</div>
        <div class="stat-card-value" id="dash-lavadoras">-</div>
      </div>
    </div>
  `;

  // Cargar datos
  try {
    const alquileres = await alquileresService.getActivos();
    document.getElementById('dash-alquileres').textContent = alquileres.length || 0;

    const clientes = await clientesService.getAll();
    document.getElementById('dash-clientes').textContent = clientes.length || 0;

    const lavadoras = await lavadorasService.getAll();
    const disponibles = lavadoras.filter(l => l.estado === 'disponible');
    document.getElementById('dash-lavadoras').textContent = disponibles.length || 0;
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}
