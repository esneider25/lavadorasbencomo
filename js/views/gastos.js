import { gastosService } from '../services/gastosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('gastos-content');
  
  contentDiv.innerHTML = `
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <button id="btn-nuevo-gasto" class="btn btn-danger" style="border-radius: 8px; padding: 10px 20px; font-weight: bold;"><i class="fa-solid fa-minus"></i> Registrar Gasto</button>
      
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-sm btn-filter active" data-filter="hoy" style="border-radius: 8px; padding: 8px 15px; background: var(--bg-card-hover); border: 1px solid var(--border-color);">Hoy</button>
        <button class="btn btn-sm btn-filter" data-filter="mes" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Este Mes</button>
        <button class="btn btn-sm btn-filter" data-filter="todos" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Todos</button>
        
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
    <div id="mini-resumen-gastos" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
      
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-calendar-day"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Gastos de Hoy</div>
          <strong id="res-gas-hoy-usd" style="font-size: 1.3rem; color: white;">$0.00</strong>
          <span id="res-gas-hoy-ves" style="font-size: 0.85rem; color: #cbd5e1;">0.00 Bs</span>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-calendar-days"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Gastos Este Mes</div>
          <strong id="res-gas-mes-usd" style="font-size: 1.3rem; color: white;">$0.00</strong>
          <span id="res-gas-mes-ves" style="font-size: 0.85rem; color: #cbd5e1;">0.00 Bs</span>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); color: #8b5cf6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-chart-pie"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div id="lbl-gas-total" style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Gastos Históricos</div>
          <strong id="res-gas-total-usd" style="font-size: 1.3rem; color: white;">$0.00</strong>
          <span id="res-gas-total-ves" style="font-size: 0.85rem; color: #cbd5e1;">0.00 Bs</span>
        </div>
      </div>

    </div>

    <!-- TABLE -->
    <div class="panel">
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

    <!-- MODAL NUEVO GASTO -->
    <div id="modal-nuevo-gasto" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-nuevo-gasto').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-file-invoice-dollar" style="color: #ef4444;"></i> Registrar Gasto</h2>
        <form id="form-gastos" style="display: flex; flex-direction: column; gap: 15px;">
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input type="text" id="gasto-desc" placeholder="Ej: Compra de manguera" required class="form-input">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Monto</label>
              <input type="number" id="gasto-monto" placeholder="Ej: 5" required class="form-input" step="0.01">
            </div>
            <div class="form-group">
              <label class="form-label">Moneda</label>
              <select id="gasto-moneda" class="form-select">
                <option value="USD">USD ($)</option>
                <option value="VES">Bolívares (Bs)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select id="gasto-categoria" class="form-select">
              <option value="repuestos">🔧 Repuestos</option>
              <option value="mantenimiento">🛠️ Mantenimiento</option>
              <option value="gasolina">⛽ Gasolina</option>
              <option value="otros">📝 Otros</option>
            </select>
          </div>
          <button type="submit" class="btn btn-danger" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; background: var(--gradient-danger);">💸 Guardar Gasto</button>
        </form>
      </div>
    </div>
  `;

  // JS Logic
  const tbody = document.getElementById('gastos-tbody');
  const modalNuevo = document.getElementById('modal-nuevo-gasto');
  const btnNuevo = document.getElementById('btn-nuevo-gasto');
  const form = document.getElementById('form-gastos');
  
  let currentFilter = 'hoy';
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
      loadGastos();
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

    loadGastos();
  });

  btnNuevo.onclick = () => {
    modalNuevo.style.display = 'flex';
  };

  async function loadGastos() {
    try {
      const gastos = await gastosService.getAll('fecha', 'desc');

      // Calcular fechas para filtros y resúmenes
      const ahora = new Date();
      const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();

      let hoyUSD = 0, hoyVES = 0;
      let mesUSD = 0, mesVES = 0;
      let totalUSD = 0, totalVES = 0;
      let rangoUSD = 0, rangoVES = 0;

      gastos.forEach(g => {
         const m = parseFloat(g.monto || 0);
         const isUSD = g.moneda === 'USD';
         
         if (isUSD) totalUSD += m; else totalVES += m;
         
         if (g.fecha >= inicioHoy) {
            if (isUSD) hoyUSD += m; else hoyVES += m;
         }
         if (g.fecha >= inicioMes) {
            if (isUSD) mesUSD += m; else mesVES += m;
         }
         if (currentFilter === 'rango' && g.fecha >= filterStart && g.fecha <= filterEnd) {
            if (isUSD) rangoUSD += m; else rangoVES += m;
         }
      });

      document.getElementById('res-gas-hoy-usd').textContent = `-$${hoyUSD.toFixed(2)}`;
      document.getElementById('res-gas-hoy-ves').textContent = `-${hoyVES.toFixed(2)} Bs`;
      
      document.getElementById('res-gas-mes-usd').textContent = `-$${mesUSD.toFixed(2)}`;
      document.getElementById('res-gas-mes-ves').textContent = `-${mesVES.toFixed(2)} Bs`;
      
      if (currentFilter === 'rango') {
          document.getElementById('lbl-gas-total').textContent = 'Gastos en Rango';
          document.getElementById('res-gas-total-usd').textContent = `-$${rangoUSD.toFixed(2)}`;
          document.getElementById('res-gas-total-ves').textContent = `-${rangoVES.toFixed(2)} Bs`;
      } else {
          document.getElementById('lbl-gas-total').textContent = 'Gastos Históricos';
          document.getElementById('res-gas-total-usd').textContent = `-$${totalUSD.toFixed(2)}`;
          document.getElementById('res-gas-total-ves').textContent = `-${totalVES.toFixed(2)} Bs`;
      }

      // Filtrar la tabla según el botón activo
      let gastosFiltrados = gastos;
      if (currentFilter === 'hoy') {
         gastosFiltrados = gastos.filter(g => g.fecha >= inicioHoy);
      } else if (currentFilter === 'mes') {
         gastosFiltrados = gastos.filter(g => g.fecha >= inicioMes);
      } else if (currentFilter === 'rango') {
         gastosFiltrados = gastos.filter(g => g.fecha >= filterStart && g.fecha <= filterEnd);
      }

      if (gastosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">No hay gastos registrados en este periodo de tiempo.</td></tr>';
        return;
      }

      tbody.innerHTML = gastosFiltrados.map(g => {
        
        let catHtml = '';
        if (g.categoria === 'repuestos') catHtml = `<span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);"><i class="fa-solid fa-wrench"></i> Repuestos</span>`;
        else if (g.categoria === 'mantenimiento') catHtml = `<span class="badge badge-info"><i class="fa-solid fa-screwdriver-wrench"></i> Mantenimiento</span>`;
        else if (g.categoria === 'gasolina') catHtml = `<span class="badge badge-warning"><i class="fa-solid fa-gas-pump"></i> Gasolina</span>`;
        else catHtml = `<span class="badge badge-neutral"><i class="fa-solid fa-tag"></i> ${g.categoria || 'Otros'}</span>`;

        let colorMonto = g.moneda === 'USD' ? '#ef4444' : '#f87171';
        let signoMonto = g.moneda === 'USD' ? '$' : 'Bs';

        return `
          <tr style="vertical-align: middle;">
            <td style="padding: 12px; color: #cbd5e1;">${new Date(g.fecha).toLocaleDateString()} <span style="font-size:0.8rem; color:#64748b; margin-left:4px;">${new Date(g.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
            <td style="padding: 12px; font-weight: 500; color: var(--text-primary); text-transform: capitalize;">${g.descripcion || '-'}</td>
            <td style="padding: 12px;">${catHtml}</td>
            <td style="padding: 12px; font-weight: bold; color: ${colorMonto}; font-size: 1.1rem;">-${parseFloat(g.monto).toFixed(2)} ${signoMonto}</td>
            <td style="padding: 12px;">
              <button class="btn btn-sm btn-icon" style="background: #ef4444; color: white; border-radius: 8px;" onclick="window.eliminarGasto('${g.id}')" title="Eliminar Gasto">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.eliminarGasto = async (id) => {
    if (!await window.appConfirm('¿Seguro que quieres eliminar este gasto?')) return;
    try {
      await gastosService.delete(id);
      await loadGastos();
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
      await gastosService.add({
        descripcion: document.getElementById('gasto-desc').value.trim(),
        monto: document.getElementById('gasto-monto').value,
        moneda: document.getElementById('gasto-moneda').value,
        categoria: document.getElementById('gasto-categoria').value,
        fecha: Date.now()
      });
      form.reset();
      modalNuevo.style.display = 'none';
      await loadGastos();
    } catch (error) {
      window.appAlert('Error al guardar el gasto');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '💸 Guardar Gasto';
    }
  });

  // Init filter and load
  loadGastos();
}
