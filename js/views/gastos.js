import { gastosService } from '../services/gastosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('gastos-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Nuevo Gasto</h3>
      <form id="form-gastos" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="gasto-desc" placeholder="Descripción" required class="input" style="flex: 1; min-width: 200px;">
        <input type="number" id="gasto-monto" placeholder="Monto" required class="input" style="width: 120px;">
        <select id="gasto-moneda" class="input" style="width: 100px;">
          <option value="USD">USD</option>
          <option value="VES">VES</option>
        </select>
        <select id="gasto-categoria" class="input" style="width: 150px;">
          <option value="repuestos">Repuestos</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="gasolina">Gasolina</option>
          <option value="otros">Otros</option>
        </select>
        <button type="submit" class="btn btn-primary">Guardar Gasto</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="gastos-tbody">
            <tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-gastos');
  const tbody = document.getElementById('gastos-tbody');

  async function loadGastos() {
    try {
      const gastos = await gastosService.getAll('fecha', 'desc');
      if (gastos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay gastos registrados</td></tr>';
        return;
      }

      tbody.innerHTML = gastos.map(g => `
        <tr>
          <td>${new Date(g.fecha).toLocaleDateString()}</td>
          <td>${g.descripcion || '-'}</td>
          <td style="text-transform: capitalize;">${g.categoria}</td>
          <td class="text-mono" style="color: red;">-${g.monto} ${g.moneda}</td>
          <td>
            <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="window.eliminarGasto('${g.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.eliminarGasto = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este gasto?')) return;
    try {
      await gastosService.remove(id);
      await loadGastos();
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
      await gastosService.add({
        descripcion: document.getElementById('gasto-desc').value,
        monto: document.getElementById('gasto-monto').value,
        moneda: document.getElementById('gasto-moneda').value,
        categoria: document.getElementById('gasto-categoria').value,
        fecha: Date.now()
      });
      form.reset();
      await loadGastos();
    } catch (error) {
      alert('Error al guardar el gasto');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar Gasto';
    }
  });

  // Carga inicial
  loadGastos();
}
