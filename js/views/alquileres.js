import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';

export async function init(db) {
  const contentDiv = document.getElementById('alquileres-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Crear Nuevo Alquiler</h3>
      <form id="form-alquileres" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <select id="alq-cliente" required class="input" style="flex: 1; min-width: 200px;">
          <option value="" disabled selected>Cargando clientes...</option>
        </select>
        <select id="alq-lavadora" required class="input" style="width: 200px;">
          <option value="" disabled selected>Cargando lavadoras...</option>
        </select>
        <input type="number" id="alq-dias" placeholder="Días de alquiler" required class="input" style="width: 150px;">
        <button type="submit" class="btn btn-primary">Iniciar Alquiler</button>
      </form>

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
    </div>
  `;

  const form = document.getElementById('form-alquileres');
  const tbody = document.getElementById('alquileres-tbody');
  const selectCliente = document.getElementById('alq-cliente');
  const selectLavadora = document.getElementById('alq-lavadora');

  // Cargar selects
  async function loadSelects() {
    try {
      const clientes = await clientesService.getAll('nombre', 'asc');
      selectCliente.innerHTML = '<option value="" disabled selected>Seleccione un Cliente</option>' + 
        clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

      const lavadoras = await lavadorasService.getDisponibles();
      selectLavadora.innerHTML = '<option value="" disabled selected>Seleccione una Lavadora</option>' + 
        lavadoras.map(l => `<option value="${l.serial}">Serial: ${l.serial} - ${l.modelo}</option>`).join('');
    } catch (e) {
      console.error("Error cargando selects:", e);
    }
  }

  async function loadAlquileres() {
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Iniciando...';

    try {
      const idLavadora = selectLavadora.value;
      
      // Get client name for easy display
      const clienteId = selectCliente.value;
      const clienteText = selectCliente.options[selectCliente.selectedIndex].text;

      await alquileresService.add({
        id_cliente: clienteId,
        clienteNombre: clienteText,
        id_lavadora: idLavadora,
        dias: document.getElementById('alq-dias').value,
        estado_alquiler: 'activo',
        fecha_inicio: Date.now()
      });

      // Update lavadora state
      await lavadorasService.cambiarEstado(idLavadora, 'alquilada');

      form.reset();
      await loadSelects();
      await loadAlquileres();
    } catch (error) {
      alert('Error al guardar el alquiler');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar Alquiler';
    }
  });

  loadSelects();
  loadAlquileres();
}
