import { clientesService } from '../services/clientesService.js';

export async function init(db) {
  const contentDiv = document.getElementById('clientes-content');
  
  contentDiv.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody id="clientes-tbody">
          <tr><td colspan="3" style="text-align: center;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('clientes-tbody');

  try {
    const clientes = await clientesService.getAll();
    if (clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay clientes registrados</td></tr>';
      return;
    }

    tbody.innerHTML = clientes.map(c => `
      <tr>
        <td class="text-primary">${c.nombre}</td>
        <td>${c.telefono || 'N/A'}</td>
        <td>${c.direccion || 'N/A'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error cargando clientes:", error);
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
  }
}
