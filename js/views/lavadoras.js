import { lavadorasService } from '../services/lavadorasService.js';
import { alquileresService } from '../services/alquileresService.js';

export async function init(db) {
  const contentDiv = document.getElementById('lavadoras-content');
  
  contentDiv.innerHTML = `
    <!-- BUSCADOR -->
    <div style="display: flex; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); justify-content: flex-end;">
      <div style="position: relative;">
        <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 12px; color: #94a3b8;"></i>
        <input type="text" id="lav-buscar" placeholder="Buscar por serial o modelo..." class="input" style="width: 300px; padding-left: 35px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
      </div>
    </div>

    <!-- MINI RESUMEN (TARJETAS) -->
    <div id="mini-resumen-lavadoras" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
      <div class="stat-card blue">
        <div class="stat-card-icon"><i class="fa-solid fa-list-ol"></i></div>
        <div class="stat-card-label">Total</div>
        <div class="stat-card-value" id="res-lav-total">0</div>
      </div>
      <div class="stat-card green">
        <div class="stat-card-icon"><i class="fa-solid fa-check-circle"></i></div>
        <div class="stat-card-label">Disponibles</div>
        <div class="stat-card-value" id="res-lav-disp">0</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-card-icon"><i class="fa-solid fa-truck-fast"></i></div>
        <div class="stat-card-label">Alquiladas</div>
        <div class="stat-card-value" id="res-lav-alq">0</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-card-icon"><i class="fa-solid fa-wrench"></i></div>
        <div class="stat-card-label">En Mantenimiento</div>
        <div class="stat-card-value" id="res-lav-mant">0</div>
      </div>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Modelo / Marca</th>
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

    <!-- MODAL DE NUEVA LAVADORA -->
    <div id="modal-nueva-lavadora" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-nueva-lavadora').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-jug-detergent" style="color: var(--accent-blue);"></i> Nueva Lavadora</h2>
        
        <form id="form-lavadoras" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="form-group">
            <label class="form-label">Número de Serial</label>
            <input type="text" id="lav-serial" placeholder="Ej: LV-001" required class="form-input">
          </div>
          
          <div class="form-group">
            <label class="form-label">Modelo / Marca</label>
            <input type="text" id="lav-modelo" placeholder="Ej: LG 11 Kg" required class="form-input">
          </div>

          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">💾 Registrar Equipo</button>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR LAVADORA -->
    <div id="modal-editar-lavadora" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-editar-lavadora').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-pen" style="color: var(--accent-blue);"></i> Editar Lavadora</h2>
        <form id="form-editar-lavadora" style="display: flex; flex-direction: column; gap: 20px;">
          <input type="hidden" id="edit-lav-id">
          <div class="form-group">
            <label class="form-label">Número de Serial</label>
            <input type="text" id="edit-lav-serial" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Modelo / Marca</label>
            <input type="text" id="edit-lav-modelo" required class="form-input">
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">💾 Guardar Cambios</button>
        </form>
      </div>
    </div>

    <!-- MODAL HISTORIAL GANANCIAS -->
    <div id="modal-historial-lavadora" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 500px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-historial-lavadora').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-chart-pie" style="color: #10b981;"></i> Rendimiento del Equipo</h2>
        <div id="historial-lav-content" style="display: flex; flex-direction: column; gap: 15px;">
           <p style="text-align: center; color: #94a3b8;">Cargando estadísticas...</p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('form-lavadoras');
  const tbody = document.getElementById('lavadoras-tbody');
  const inputBuscar = document.getElementById('lav-buscar');
  const modalNuevaLavadora = document.getElementById('modal-nueva-lavadora');
  const btnNuevaLavadora = document.getElementById('btn-nueva-lavadora');

  if (btnNuevaLavadora) {
    btnNuevaLavadora.onclick = () => {
      modalNuevaLavadora.style.display = 'flex';
    };
  }

  inputBuscar.addEventListener('input', () => {
    loadLavadoras();
  });

  async function loadLavadoras() {
    try {
      let lavadoras = await lavadorasService.getAll();
      
      const searchTerm = inputBuscar.value.toLowerCase().trim();
      if (searchTerm) {
        lavadoras = lavadoras.filter(l => {
          const serial = (l.serial || '').toLowerCase();
          const modelo = (l.modelo || '').toLowerCase();
          return serial.includes(searchTerm) || modelo.includes(searchTerm);
        });
      }

      // Calcular Resumen
      let total = lavadoras.length;
      let disp = 0;
      let alq = 0;
      let mant = 0;

      lavadoras.forEach(l => {
        const est = l.estado || l.estado_lavadora;
        if (est === 'disponible') disp++;
        else if (est === 'alquilada') alq++;
        else if (est === 'mantenimiento') mant++;
      });

      document.getElementById('res-lav-total').textContent = total;
      document.getElementById('res-lav-disp').textContent = disp;
      document.getElementById('res-lav-alq').textContent = alq;
      document.getElementById('res-lav-mant').textContent = mant;

      if (lavadoras.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">No hay resultados encontrados.</td></tr>';
        return;
      }

      tbody.innerHTML = lavadoras.map(l => {
        let estado = l.estado || l.estado_lavadora || 'N/A';
        let badgeColor = estado === 'disponible' ? 'success' : (estado === 'alquilada' ? 'info' : (estado === 'mantenimiento' ? 'warning' : 'neutral'));
        let btnDisabled = estado !== 'disponible' ? 'disabled title="Acción bloqueada en este estado"' : '';
        
        let actionButtons = `
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-icon" style="background: #3b82f6; color: white;" onclick="window.verHistorialLavadora('${l.id}', '${l.serial}', '${l.modelo}')" title="Ver Historial de Ganancias">
              <i class="fa-solid fa-chart-line"></i>
            </button>
            <button class="btn btn-sm btn-icon" style="background: #8b5cf6; color: white;" onclick="window.abrirEditarLavadora('${l.id}', '${l.serial}', '${l.modelo}')" title="Editar Equipo" ${btnDisabled}>
              <i class="fa-solid fa-pen"></i>
            </button>
        `;

        if (estado === 'disponible') {
           actionButtons += `
            <button class="btn btn-sm btn-icon" style="background: #f59e0b; color: white;" onclick="window.enviarMantenimiento('${l.id}')" title="Enviar a Mantenimiento">
              <i class="fa-solid fa-wrench"></i>
            </button>
           `;
        }

        if (estado === 'mantenimiento') {
           actionButtons += `
            <button class="btn btn-sm btn-icon" style="background: #10b981; color: white;" onclick="window.repararLavadora('${l.id}')" title="Marcar como Reparada (Disponible)">
              <i class="fa-solid fa-check"></i>
            </button>
           `;
        }

        actionButtons += `
            <button class="btn btn-sm btn-icon" style="background: #ef4444; color: white;" onclick="window.eliminarLavadora('${l.id}')" title="Eliminar del inventario" ${btnDisabled}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;

        return `
          <tr>
            <td class="text-mono">${l.serial || 'N/A'}</td>
            <td><strong>${l.modelo || 'N/A'}</strong></td>
            <td><span class="badge badge-${badgeColor}"><div class="badge-dot"></div>${estado}</span></td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');
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

  window.abrirEditarLavadora = (id, serial, modelo) => {
    document.getElementById('edit-lav-id').value = id;
    document.getElementById('edit-lav-serial').value = serial !== 'undefined' ? serial : '';
    document.getElementById('edit-lav-modelo').value = (modelo !== 'undefined' && modelo !== 'N/A') ? modelo : '';
    document.getElementById('modal-editar-lavadora').style.display = 'flex';
  };

  window.enviarMantenimiento = async (id) => {
    if (!confirm('¿Seguro que quieres reportar esta lavadora como dañada / en mantenimiento?')) return;
    try {
      await lavadorasService.cambiarEstado(id, 'mantenimiento');
      await loadLavadoras();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.repararLavadora = async (id) => {
    if (!confirm('¿La lavadora ya fue reparada y está lista para alquilar?')) return;
    try {
      await lavadorasService.cambiarEstado(id, 'disponible');
      await loadLavadoras();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.verHistorialLavadora = async (id, serial, modelo) => {
    const modal = document.getElementById('modal-historial-lavadora');
    const content = document.getElementById('historial-lav-content');
    modal.style.display = 'flex';
    content.innerHTML = '<p style="text-align: center; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Calculando estadísticas...</p>';

    try {
      const todosAlquileres = await alquileresService.getAll();
      const alquileresEquipo = todosAlquileres.filter(a => a.id_lavadora === id);
      
      let vecesAlquilada = alquileresEquipo.length;
      let totalGanado = 0;
      let clientesUnicos = new Set();

      alquileresEquipo.forEach(a => {
        totalGanado += parseFloat(a.costo_total || 0);
        if (a.clienteNombre) clientesUnicos.add(a.clienteNombre);
      });

      content.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center; margin-bottom: 10px;">
          <h3 style="color: var(--text-primary); margin: 0 0 5px 0;">${serial} - ${modelo}</h3>
          <span class="badge badge-success">Resumen Histórico</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; color: #10b981; font-weight: bold;">$${totalGanado.toFixed(2)}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase;">Generado</div>
          </div>
          
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; color: #3b82f6; font-weight: bold;">${vecesAlquilada}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase;">Veces Alquilada</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px; color: #cbd5e1; font-size: 0.9rem;">
          <i class="fa-solid fa-users text-tertiary"></i> Usada por <strong>${clientesUnicos.size}</strong> clientes diferentes.
        </div>
      `;

    } catch(e) {
      content.innerHTML = '<p style="color: #ef4444; text-align: center;">Error al cargar historial.</p>';
    }
  };

  const formEditar = document.getElementById('form-editar-lavadora');
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formEditar.querySelector('button');
      const id = document.getElementById('edit-lav-id').value;
      const serialVal = document.getElementById('edit-lav-serial').value.trim();
      const modeloVal = document.getElementById('edit-lav-modelo').value.trim();

      if (!serialVal || serialVal.toLowerCase() === 'undefined') {
        alert('Serial inválido o vacío.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Guardando...';

      try {
        await lavadorasService.update(id, {
          serial: serialVal,
          modelo: modeloVal
        });
        document.getElementById('modal-editar-lavadora').style.display = 'none';
        await loadLavadoras();
      } catch (error) {
        alert('Error al guardar: ' + error.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '💾 Guardar Cambios';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const serialVal = document.getElementById('lav-serial').value.trim();
    const modeloVal = document.getElementById('lav-modelo').value.trim();

    if (!serialVal || serialVal.toLowerCase() === 'undefined') {
      alert('Serial inválido o vacío. Por favor verifique.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await lavadorasService.add({
        serial: serialVal,
        modelo: modeloVal,
        estado: 'disponible'
      });
      form.reset();
      modalNuevaLavadora.style.display = 'none';
      await loadLavadoras();
    } catch (error) {
      alert('Error al guardar la lavadora');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '💾 Registrar Equipo';
    }
  });

  loadLavadoras();
}
