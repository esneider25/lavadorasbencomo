import { mantenimientoService } from '../services/mantenimientoService.js';

export async function init(db) {
  const contentDiv = document.getElementById('mantenimiento-content');
  
  contentDiv.innerHTML = `
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <button id="btn-nuevo-mant" class="btn btn-primary" style="border-radius: 8px; padding: 10px 20px; font-weight: bold; background: var(--gradient-primary);"><i class="fa-solid fa-wrench"></i> Agendar Mantenimiento</button>
      
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-sm btn-filter active" data-filter="todos" style="border-radius: 8px; padding: 8px 15px; background: var(--bg-card-hover); border: 1px solid var(--border-color);">Todos</button>
        <button class="btn btn-sm btn-filter" data-filter="pendientes" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Pendientes</button>
        <button class="btn btn-sm btn-filter" data-filter="completados" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Completados</button>
        
        <!-- Filtro Rango de Fechas -->
        <div style="display: flex; align-items: center; gap: 5px; margin-left: 10px; border-left: 1px solid var(--border-color); padding-left: 10px;">
           <span style="font-size: 0.8rem; color: #94a3b8;">Desde:</span>
           <input type="date" id="filtro-fecha-inicio" class="input" style="padding: 4px 8px; font-size: 0.8rem; border-radius: 6px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); color-scheme: dark;">
           <span style="font-size: 0.8rem; color: #94a3b8;">Hasta:</span>
           <input type="date" id="filtro-fecha-fin" class="input" style="padding: 4px 8px; font-size: 0.8rem; border-radius: 6px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); color-scheme: dark;">
           <button id="btn-filtro-rango" class="btn btn-sm" style="background: var(--bg-card-hover); border: 1px solid var(--border-color); border-radius: 6px; padding: 5px 10px;" title="Aplicar Rango"><i class="fa-solid fa-filter"></i></button>
        </div>
      </div>
    </div>

    <!-- MINI RESUMEN -->
    <div id="mini-resumen-mant" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
      
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Tareas Pendientes</div>
          <strong id="res-mant-pendientes" style="font-size: 1.4rem; color: white;">0</strong>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-check-double"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Mantenimientos Listos</div>
          <strong id="res-mant-completados" style="font-size: 1.4rem; color: white;">0</strong>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div id="lbl-mant-costo" style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Costo Total Estimado</div>
          <strong id="res-mant-costo" style="font-size: 1.4rem; color: white;">$0.00</strong>
        </div>
      </div>

    </div>

    <!-- TABLE -->
    <div class="panel">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha Programada</th>
              <th>Lavadora</th>
              <th>Técnico</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="mant-tbody">
            <tr><td colspan="6" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL NUEVO MANTENIMIENTO -->
    <div id="modal-nuevo-mant" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-nuevo-mant').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-screwdriver-wrench" style="color: #3b82f6;"></i> Agendar Tarea</h2>
        <form id="form-mantenimiento" style="display: flex; flex-direction: column; gap: 15px;">
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">ID Lavadora</label>
              <input type="text" id="mant-lavadora" placeholder="Ej: LV-01" required class="form-input">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Costo Estimado ($)</label>
              <input type="number" id="mant-costo" placeholder="Opcional" class="form-input" step="0.01">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Técnico Asignado</label>
            <input type="text" id="mant-tecnico" placeholder="Nombre del técnico (Opcional)" class="form-input">
          </div>
          
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Fecha Programada</label>
              <input type="date" id="mant-fecha" required class="form-input">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Estado Inicial</label>
              <select id="mant-estado" class="form-select">
                <option value="pendiente">⏳ Pendiente</option>
                <option value="completado">✅ Completado</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; background: var(--gradient-primary);">🛠️ Guardar Registro</button>
        </form>
      </div>
    </div>
  `;

  // JS Logic
  const tbody = document.getElementById('mant-tbody');
  const modalNuevo = document.getElementById('modal-nuevo-mant');
  const btnNuevo = document.getElementById('btn-nuevo-mant');
  const form = document.getElementById('form-mantenimiento');
  
  let currentFilter = 'todos';
  let filterStart = null;
  let filterEnd = null;

  const btnFiltroRango = document.getElementById('btn-filtro-rango');
  const inputFechaInicio = document.getElementById('filtro-fecha-inicio');
  const inputFechaFin = document.getElementById('filtro-fecha-fin');

  // Filters setup
  const filterBtns = document.querySelectorAll('.btn-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
         b.classList.remove('active');
         b.style.background = 'transparent';
      });
      e.target.classList.add('active');
      e.target.style.background = 'var(--bg-card-hover)';
      
      currentFilter = e.target.getAttribute('data-filter');
      loadMantenimientos();
    });
  });

  btnFiltroRango.addEventListener('click', () => {
    if (!inputFechaInicio.value || !inputFechaFin.value) {
       window.appAlert("Selecciona la fecha de 'Desde' y 'Hasta' para filtrar.");
       return;
    }
    
    filterBtns.forEach(b => {
       b.classList.remove('active');
       b.style.background = 'transparent';
    });
    
    currentFilter = 'rango';
    
    const [sy, sm, sd] = inputFechaInicio.value.split('-');
    const [ey, em, ed] = inputFechaFin.value.split('-');
    
    filterStart = new Date(sy, sm - 1, sd, 0, 0, 0).getTime();
    filterEnd = new Date(ey, em - 1, ed, 23, 59, 59).getTime();

    loadMantenimientos();
  });

  btnNuevo.onclick = () => {
    document.getElementById('mant-fecha').valueAsDate = new Date();
    modalNuevo.style.display = 'flex';
  };

  async function loadMantenimientos() {
    try {
      const mant = await mantenimientoService.getAll('fecha_programada', 'desc');

      let pendientes = 0;
      let completados = 0;
      let costoTotal = 0;
      let costoRango = 0;

      mant.forEach(m => {
         const c = parseFloat(m.costo || 0);
         costoTotal += c;
         if (m.estado === 'pendiente') pendientes++;
         if (m.estado === 'completado') completados++;
         
         if (currentFilter === 'rango' && m.fecha_programada >= filterStart && m.fecha_programada <= filterEnd) {
             costoRango += c;
         }
      });

      document.getElementById('res-mant-pendientes').textContent = pendientes;
      document.getElementById('res-mant-completados').textContent = completados;
      
      if (currentFilter === 'rango') {
          document.getElementById('lbl-mant-costo').textContent = 'Costo en Rango';
          document.getElementById('res-mant-costo').textContent = `$${costoRango.toFixed(2)}`;
      } else {
          document.getElementById('lbl-mant-costo').textContent = 'Costo Total Estimado';
          document.getElementById('res-mant-costo').textContent = `$${costoTotal.toFixed(2)}`;
      }

      // Filtrar la tabla según el botón activo
      let mantFiltrados = mant;
      if (currentFilter === 'pendientes') {
         mantFiltrados = mant.filter(m => m.estado === 'pendiente');
      } else if (currentFilter === 'completados') {
         mantFiltrados = mant.filter(m => m.estado === 'completado');
      } else if (currentFilter === 'rango') {
         mantFiltrados = mant.filter(m => m.fecha_programada >= filterStart && m.fecha_programada <= filterEnd);
      }

      if (mantFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">No hay mantenimientos registrados en este periodo de tiempo o estado.</td></tr>';
        return;
      }

      tbody.innerHTML = mantFiltrados.map(m => {
        let estadoHtml = '';
        if (m.estado === 'completado') {
           estadoHtml = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-check"></i> Completado</span>`;
        } else {
           estadoHtml = `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-clock"></i> Pendiente</span>`;
        }

        let costoStr = m.costo ? `<strong style="color: #cbd5e1;">$${parseFloat(m.costo).toFixed(2)}</strong>` : '<span style="color:#64748b;">-</span>';

        return `
          <tr style="vertical-align: middle;">
            <td style="padding: 12px; color: #cbd5e1;">
               ${new Date(m.fecha_programada).toLocaleDateString()} 
            </td>
            <td style="padding: 12px; font-weight: bold; color: var(--text-primary); text-transform: uppercase;">
               <i class="fa-solid fa-jug-detergent" style="color: #64748b; font-size: 0.8rem; margin-right: 5px;"></i>${m.id_lavadora}
            </td>
            <td style="padding: 12px; color: #94a3b8; text-transform: capitalize;">
               <i class="fa-solid fa-user-gear" style="color: #64748b; font-size: 0.8rem; margin-right: 5px;"></i>${m.tecnico || 'N/A'}
            </td>
            <td style="padding: 12px;">${costoStr}</td>
            <td style="padding: 12px;">${estadoHtml}</td>
            <td style="padding: 12px;">
              <button class="btn btn-sm btn-icon" style="background: var(--bg-card-hover); color: white; border-radius: 8px; margin-right: 5px;" onclick="window.cambiarEstadoMant('${m.id}', '${m.estado}')" title="Cambiar Estado">
                <i class="fa-solid fa-rotate"></i>
              </button>
              <button class="btn btn-sm btn-icon" style="background: #ef4444; color: white; border-radius: 8px;" onclick="window.eliminarMantenimiento('${m.id}')" title="Eliminar Mantenimiento">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  // Helper para cambiar de estado rápidamente
  window.cambiarEstadoMant = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'pendiente' ? 'completado' : 'pendiente';
    try {
      await mantenimientoService.update(id, { estado: nuevoEstado });
      await loadMantenimientos();
    } catch (e) {
      window.appAlert('Error al cambiar estado: ' + e.message);
    }
  };

  window.eliminarMantenimiento = async (id) => {
    if (!await window.appConfirm('¿Seguro que quieres eliminar este registro de mantenimiento?')) return;
    try {
      await mantenimientoService.delete(id);
      await loadMantenimientos();
    } catch (e) {
      window.appAlert('Error al eliminar: ' + e.message);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const dateParts = document.getElementById('mant-fecha').value.split('-');
      const dateTs = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getTime();

      await mantenimientoService.add({
        id_lavadora: document.getElementById('mant-lavadora').value.trim(),
        tecnico: document.getElementById('mant-tecnico').value.trim(),
        costo: document.getElementById('mant-costo').value,
        fecha_programada: dateTs,
        estado: document.getElementById('mant-estado').value
      });
      form.reset();
      modalNuevo.style.display = 'none';
      await loadMantenimientos();
    } catch (error) {
      window.appAlert('Error al guardar el mantenimiento');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🛠️ Guardar Registro';
    }
  });

  // Init filter and load
  loadMantenimientos();
}
