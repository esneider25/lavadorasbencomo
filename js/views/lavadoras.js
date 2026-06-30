import { lavadorasService } from '../services/lavadorasService.js';

export async function init(db) {
  const contentDiv = document.getElementById('lavadoras-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Nueva Lavadora</h3>
      <form id="form-lavadoras" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="lav-serial" placeholder="Número de Serial" required class="input" style="width: 200px;">
        <input type="text" id="lav-modelo" placeholder="Modelo / Marca" required class="input" style="width: 200px;">
        <button type="submit" class="btn btn-primary">Registrar Lavadora</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="lavadoras-tbody">
            <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-lavadoras');
  const tbody = document.getElementById('lavadoras-tbody');

  async function loadLavadoras() {
    try {
      const lavadoras = await lavadorasService.getAll();
      if (lavadoras.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay lavadoras registradas</td></tr>';
        return;
      }

      tbody.innerHTML = lavadoras.map(l => `
        <tr>
          <td class="text-mono">${l.serial}</td>
          <td>${l.modelo || 'N/A'}</td>
          <td><span class="badge badge-${l.estado === 'disponible' ? 'success' : (l.estado === 'alquilada' ? 'info' : (l.estado === 'mantenimiento' ? 'warning' : 'neutral'))}"><div class="badge-dot"></div>${l.estado || l.estado_lavadora}</span></td>
          <td>
            <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="window.eliminarLavadora('${l.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error("Error cargando lavadoras:", error);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.eliminarLavadora = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta lavadora del inventario?')) return;
    try {
      await lavadorasService.remove(id);
      await loadLavadoras();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await lavadorasService.add({
        serial: document.getElementById('lav-serial').value,
        modelo: document.getElementById('lav-modelo').value,
        estado: 'disponible'
      });
      form.reset();
      await loadLavadoras();
    } catch (error) {
      alert('Error al guardar la lavadora');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrar Lavadora';
    }
  });

  loadLavadoras();
}
