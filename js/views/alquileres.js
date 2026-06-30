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
              <th>Lavadora</th>
              <th>Cliente</th>
              <th>Días</th>
              <th>Estado Logístico</th>
              <th>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody id="alquileres-tbody">
            <tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>
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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay alquileres registrados</td></tr>';
        return;
      }

      // Ordenar: primero los activos, luego finalizados
      alquileres.sort((a, b) => (a.estado_alquiler === 'activo' ? -1 : 1));

      tbody.innerHTML = alquileres.map(a => {
        let estadoLogistica = a.estado_logistica || 'entregada'; // retrocompatibilidad
        let badgeColor = 'neutral';
        let badgeText = estadoLogistica;
        let actionButtons = '';

        // Definir badges y botones según el estado logístico y de alquiler
        if (a.estado_alquiler === 'activo') {
          if (estadoLogistica === 'entrega_pendiente') {
            badgeColor = 'warning'; badgeText = 'Entrega Pendiente';
            actionButtons = `<button class="btn btn-sm" style="background: #f59e0b; color: white;" onclick="window.cambiarLogistica('${a.id}', 'entrega_en_ruta')">🚗 Despachar</button>`;
          } else if (estadoLogistica === 'entrega_en_ruta') {
            badgeColor = 'info'; badgeText = 'En Ruta a Cliente';
            actionButtons = `<button class="btn btn-sm" style="background: #3b82f6; color: white;" onclick="window.cambiarLogistica('${a.id}', 'entregada')">✅ Marcar Entregada</button>`;
          } else if (estadoLogistica === 'entregada') {
            badgeColor = 'success'; badgeText = 'En Uso (Entregada)';
            actionButtons = `<button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="window.finalizarAlquiler('${a.id}', '${a.id_lavadora}')">🛑 Finalizar Alquiler</button>`;
          }
        } else { // finalizado
          if (estadoLogistica === 'recogida_pendiente') {
            badgeColor = 'warning'; badgeText = 'Recogida Pendiente';
            actionButtons = `<button class="btn btn-sm" style="background: #f59e0b; color: white;" onclick="window.cambiarLogistica('${a.id}', 'recogida_en_ruta')">🚚 Ir a Buscar</button>`;
          } else if (estadoLogistica === 'recogida_en_ruta') {
            badgeColor = 'info'; badgeText = 'En Ruta de Regreso';
            actionButtons = `<button class="btn btn-sm" style="background: #10b981; color: white;" onclick="window.marcarDevuelta('${a.id}', '${a.id_lavadora}')">🏠 Ya en Almacén</button>`;
          } else {
            badgeColor = 'neutral'; badgeText = 'Ciclo Completado';
            actionButtons = `<button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="window.eliminarRegistro('${a.id}')"><i class="fa-solid fa-trash"></i></button>`;
          }
        }

        return `
        <tr>
          <td class="text-mono">${a.id_lavadora}</td>
          <td>${a.clienteNombre || a.id_cliente}</td>
          <td>${a.dias || '-'}</td>
          <td><span class="badge badge-${badgeColor}"><div class="badge-dot"></div>${badgeText}</span></td>
          <td style="display: flex; gap: 5px;">${actionButtons}</td>
        </tr>
      `}).join('');
    } catch (error) {
      console.error("Error cargando alquileres:", error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.cambiarLogistica = async (idAlquiler, nuevoEstado) => {
    try {
      await alquileresService.update(idAlquiler, { estado_logistica: nuevoEstado });
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.finalizarAlquiler = async (idAlquiler, idLavadora) => {
    if (!confirm('¿El cliente ya no va a usar más la lavadora? Se marcará para recogida.')) return;
    try {
      // alquileresService.finalizar setea estado_alquiler='finalizado' y estado_logistica='recogida_pendiente'
      await alquileresService.finalizar(idAlquiler);
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.marcarDevuelta = async (idAlquiler, idLavadora) => {
    if (!confirm('¿La lavadora ya está de vuelta en el almacén?')) return;
    try {
      await alquileresService.update(idAlquiler, { estado_logistica: 'devuelta' });
      // Aquí liberamos la lavadora para que se pueda volver a alquilar
      await lavadorasService.cambiarEstado(idLavadora, 'disponible');
      await loadAlquileres();
      await loadSelects(); 
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.eliminarRegistro = async (idAlquiler) => {
    if (!confirm('¿Eliminar este registro del historial?')) return;
    try {
      await alquileresService.remove(idAlquiler);
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Iniciando...';

    try {
      const idLavadora = selectLavadora.value;
      const clienteId = selectCliente.value;
      const clienteText = selectCliente.options[selectCliente.selectedIndex].text;

      await alquileresService.add({
        id_cliente: clienteId,
        clienteNombre: clienteText,
        id_lavadora: idLavadora,
        dias: document.getElementById('alq-dias').value,
        estado_alquiler: 'activo',
        estado_logistica: 'entrega_pendiente', // Integración de logística inicial
        fecha_inicio: Date.now()
      });

      // La lavadora se marca como alquilada de una vez para que nadie más la tome
      await lavadorasService.cambiarEstado(idLavadora, 'alquilada');

      form.reset();
      await loadSelects();
      await loadAlquileres();
    } catch (error) {
      alert('Error al guardar');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar Alquiler';
    }
  });

  loadSelects();
  loadAlquileres();
}
