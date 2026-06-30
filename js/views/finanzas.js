import { pagosService } from '../services/pagosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('finanzas-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Nuevo Pago Recibido</h3>
      <form id="form-pagos" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="pago-alquiler" placeholder="ID del Alquiler (Opcional)" class="input" style="width: 180px;">
        <input type="number" id="pago-monto" placeholder="Monto" required class="input" style="width: 120px;">
        <select id="pago-metodo" class="input" style="width: 150px;">
          <option value="pago_movil">Pago Móvil</option>
          <option value="transferencia">Transferencia</option>
          <option value="efectivo_bs">Efectivo Bs</option>
          <option value="efectivo_usd">Efectivo USD</option>
        </select>
        <button type="submit" class="btn btn-primary">Registrar Pago</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Alquiler Asociado</th>
              <th>Método de Pago</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody id="pagos-tbody">
            <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-pagos');
  const tbody = document.getElementById('pagos-tbody');

  const metodoNombres = {
    pago_movil: 'Pago Móvil',
    transferencia: 'Transferencia',
    efectivo_bs: 'Efectivo Bs',
    efectivo_usd: 'Efectivo USD'
  };

  async function loadPagos() {
    try {
      const pagos = await pagosService.getAll('fecha', 'desc');
      if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay pagos registrados</td></tr>';
        return;
      }

      tbody.innerHTML = pagos.map(p => `
        <tr>
          <td>${new Date(p.fecha).toLocaleDateString()}</td>
          <td class="text-mono">${p.id_alquiler || 'General'}</td>
          <td><span class="badge badge-neutral">${metodoNombres[p.metodo] || p.metodo}</span></td>
          <td class="text-mono" style="color: green;">+${p.monto}</td>
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
      await pagosService.add({
        id_alquiler: document.getElementById('pago-alquiler').value,
        monto: document.getElementById('pago-monto').value,
        metodo: document.getElementById('pago-metodo').value,
        fecha: Date.now()
      });
      form.reset();
      await loadPagos();
    } catch (error) {
      alert('Error al registrar el pago');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrar Pago';
    }
  });

  loadPagos();
}
