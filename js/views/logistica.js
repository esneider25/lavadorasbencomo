import { logisticaService } from '../services/logisticaService.js';

export async function init(db) {
  const contentDiv = document.getElementById('logistica-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Despacho / Recogida</h3>
      <form id="form-logistica" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="log-cliente" placeholder="Cliente" required class="input" style="width: 150px;">
        <input type="text" id="log-direccion" placeholder="Dirección" required class="input" style="flex: 1; min-width: 200px;">
        <select id="log-tipo" class="input" style="width: 120px;">
          <option value="entrega">Entrega</option>
          <option value="recogida">Recogida</option>
        </select>
        <select id="log-estado" class="input" style="width: 120px;">
          <option value="pendiente">Pendiente</option>
          <option value="en_ruta">En Ruta</option>
          <option value="completado">Completado</option>
        </select>
        <button type="submit" class="btn btn-primary">Registrar</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="log-tbody">
            <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-logistica');
  const tbody = document.getElementById('log-tbody');

  async function loadDespachos() {
    try {
      const despachos = await logisticaService.getAll('fecha_programada', 'desc');
      if (despachos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay movimientos logísticos</td></tr>';
        return;
      }

      tbody.innerHTML = despachos.map(d => `
        <tr>
          <td>${d.cliente}</td>
          <td>${d.direccion}</td>
          <td><span class="badge badge-${d.tipo === 'entrega' ? 'success' : 'neutral'}">${d.tipo}</span></td>
          <td><span class="badge badge-${d.estado === 'completado' ? 'success' : 'warning'}"><div class="badge-dot"></div>${d.estado.replace('_', ' ')}</span></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await logisticaService.add({
        cliente: document.getElementById('log-cliente').value,
        direccion: document.getElementById('log-direccion').value,
        tipo: document.getElementById('log-tipo').value,
        estado: document.getElementById('log-estado').value,
        fecha_programada: Date.now() // por defecto el dia de hoy
      });
      form.reset();
      await loadDespachos();
    } catch (error) {
      alert('Error al guardar');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrar';
    }
  });

  loadDespachos();
}
