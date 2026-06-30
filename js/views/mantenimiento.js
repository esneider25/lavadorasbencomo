import { mantenimientoService } from '../services/mantenimientoService.js';

export async function init(db) {
  const contentDiv = document.getElementById('mantenimiento-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Mantenimiento</h3>
      <form id="form-mantenimiento" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="mant-lavadora" placeholder="ID Lavadora" required class="input" style="width: 150px;">
        <input type="text" id="mant-tecnico" placeholder="Técnico (Opcional)" class="input" style="width: 150px;">
        <input type="number" id="mant-costo" placeholder="Costo Estimado" class="input" style="width: 120px;">
        <input type="date" id="mant-fecha" required class="input" style="width: 150px;">
        <select id="mant-estado" class="input" style="width: 130px;">
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
        </select>
        <button type="submit" class="btn btn-primary">Agendar</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha Programada</th>
              <th>Lavadora</th>
              <th>Técnico</th>
              <th>Costo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="mant-tbody">
            <tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-mantenimiento');
  const tbody = document.getElementById('mant-tbody');

  // Set today as default date
  document.getElementById('mant-fecha').valueAsDate = new Date();

  async function loadMantenimientos() {
    try {
      const mant = await mantenimientoService.getAll('fecha_programada', 'desc');
      if (mant.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay mantenimientos registrados</td></tr>';
        return;
      }

      tbody.innerHTML = mant.map(m => `
        <tr>
          <td>${new Date(m.fecha_programada).toLocaleDateString()}</td>
          <td class="text-mono">${m.id_lavadora}</td>
          <td>${m.tecnico || 'No asignado'}</td>
          <td>${m.costo ? `$${m.costo}` : '-'}</td>
          <td><span class="badge badge-${m.estado === 'completado' ? 'success' : 'warning'}"><div class="badge-dot"></div>${m.estado}</span></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      // Parse YYYY-MM-DD to timestamp
      const dateParts = document.getElementById('mant-fecha').value.split('-');
      const dateTs = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getTime();

      await mantenimientoService.add({
        id_lavadora: document.getElementById('mant-lavadora').value,
        tecnico: document.getElementById('mant-tecnico').value,
        costo: document.getElementById('mant-costo').value,
        fecha_programada: dateTs,
        estado: document.getElementById('mant-estado').value
      });
      form.reset();
      document.getElementById('mant-fecha').valueAsDate = new Date();
      await loadMantenimientos();
    } catch (error) {
      alert('Error al guardar el mantenimiento');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Agendar';
    }
  });

  loadMantenimientos();
}
