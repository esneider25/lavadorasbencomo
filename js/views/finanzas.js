import { pagosService } from '../services/pagosService.js';
import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';

export async function init(db) {
  const contentDiv = document.getElementById('finanzas-content');
  
  contentDiv.innerHTML = `
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <button id="btn-nuevo-pago" class="btn btn-primary" style="border-radius: 8px; padding: 10px 20px; font-weight: bold;"><i class="fa-solid fa-plus"></i> Registrar Pago</button>
      
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-sm btn-filter active" data-filter="hoy" style="border-radius: 8px; padding: 8px 15px; background: var(--bg-card-hover); border: 1px solid var(--border-color);">Hoy</button>
        <button class="btn btn-sm btn-filter" data-filter="mes" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Este Mes</button>
        <button class="btn btn-sm btn-filter" data-filter="todos" style="border-radius: 8px; padding: 8px 15px; background: transparent; border: 1px solid var(--border-color);">Todos</button>
      </div>
    </div>

    <!-- MINI RESUMEN -->
    <div id="mini-resumen-finanzas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
      
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-calendar-day"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Ingresos Hoy</div>
          <strong id="res-fin-hoy" style="font-size: 1.4rem; color: white;">$0.00</strong>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-calendar-days"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Ingresos Este Mes</div>
          <strong id="res-fin-mes" style="font-size: 1.4rem; color: white;">$0.00</strong>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); color: #8b5cf6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-vault"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Ingresos Históricos</div>
          <strong id="res-fin-total" style="font-size: 1.4rem; color: white;">$0.00</strong>
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
              <th>Cliente / Concepto</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="pagos-tbody">
            <tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL NUEVO PAGO -->
    <div id="modal-nuevo-pago" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-nuevo-pago').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-money-bill-wave" style="color: #10b981;"></i> Registrar Pago</h2>
        <form id="form-pagos" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="form-group">
            <label class="form-label">ID del Alquiler (Opcional)</label>
            <input type="text" id="pago-alquiler" placeholder="Opcional" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Monto ($)</label>
            <input type="number" id="pago-monto" placeholder="Ej: 15" required class="form-input" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Método de Pago</label>
            <select id="pago-metodo" class="form-select">
              <option value="pago_movil">Pago Móvil</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo_bs">Efectivo Bs</option>
              <option value="efectivo_usd">Efectivo USD</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; background: var(--gradient-success);">💰 Guardar Ingreso</button>
        </form>
      </div>
    </div>
  `;

  // JS Logic
  const tbody = document.getElementById('pagos-tbody');
  const modalNuevo = document.getElementById('modal-nuevo-pago');
  const btnNuevo = document.getElementById('btn-nuevo-pago');
  const form = document.getElementById('form-pagos');
  
  let currentFilter = 'hoy';

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
      loadPagos();
    });
  });

  btnNuevo.onclick = () => {
    modalNuevo.style.display = 'flex';
  };

  async function loadPagos() {
    try {
      const pagos = await pagosService.getAll('fecha', 'desc');
      const alquileres = await alquileresService.getAll();
      const clientes = await clientesService.getAll();

      // Mapear alquileres y clientes para rápido acceso
      const mapAlquileres = {};
      alquileres.forEach(a => mapAlquileres[a.id] = a);

      const mapClientes = {};
      clientes.forEach(c => mapClientes[c.id] = c);

      // Calcular fechas para filtros y resúmenes
      const ahora = new Date();
      const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();

      let totalHoy = 0;
      let totalMes = 0;
      let totalHistorico = 0;

      pagos.forEach(p => {
         const m = parseFloat(p.monto || 0);
         totalHistorico += m;
         if (p.fecha >= inicioHoy) totalHoy += m;
         if (p.fecha >= inicioMes) totalMes += m;
      });

      document.getElementById('res-fin-hoy').textContent = `$${totalHoy.toFixed(2)}`;
      document.getElementById('res-fin-mes').textContent = `$${totalMes.toFixed(2)}`;
      document.getElementById('res-fin-total').textContent = `$${totalHistorico.toFixed(2)}`;

      // Filtrar la tabla según el botón activo
      let pagosFiltrados = pagos;
      if (currentFilter === 'hoy') {
         pagosFiltrados = pagos.filter(p => p.fecha >= inicioHoy);
      } else if (currentFilter === 'mes') {
         pagosFiltrados = pagos.filter(p => p.fecha >= inicioMes);
      }

      if (pagosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">No hay ingresos en este periodo de tiempo.</td></tr>';
        return;
      }

      tbody.innerHTML = pagosFiltrados.map(p => {
        // Traductor Inteligente
        let textoAlquiler = '<span style="color:#94a3b8;">Ingreso General (Sin Alquiler)</span>';
        if (p.id_alquiler) {
           const alq = mapAlquileres[p.id_alquiler];
           if (alq) {
              const cli = mapClientes[alq.id_cliente];
              const nombreCli = cli ? cli.nombre : 'Cliente Eliminado';
              const lavId = alq.id_lavadora || '?';
              textoAlquiler = `
              <div style="display:flex; flex-direction:column;">
                <strong style="color:var(--text-primary); text-transform: capitalize;">${nombreCli}</strong>
                <span style="font-size:0.8rem; color:#8892a8;"><i class="fa-solid fa-jug-detergent" style="font-size:0.7rem;"></i> Lavadora ${lavId}</span>
              </div>`;
           } else {
              textoAlquiler = `<span class="text-mono" style="font-size:0.8rem; color:#64748b;">ID: ${p.id_alquiler.substring(0,8)}...</span>`;
           }
        }

        // Estilo de método de pago
        let methodHtml = '';
        if (p.metodo === 'pago_movil') methodHtml = `<span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);"><i class="fa-solid fa-mobile-screen"></i> Pago Móvil</span>`;
        else if (p.metodo === 'transferencia') methodHtml = `<span class="badge badge-info"><i class="fa-solid fa-building-columns"></i> Transf.</span>`;
        else if (p.metodo === 'efectivo_usd') methodHtml = `<span class="badge badge-success"><i class="fa-solid fa-money-bill-1-wave"></i> Efectivo USD</span>`;
        else if (p.metodo === 'efectivo_bs') methodHtml = `<span class="badge badge-warning"><i class="fa-solid fa-money-bill"></i> Efectivo Bs</span>`;
        else methodHtml = `<span class="badge badge-neutral">${p.metodo || 'Otro'}</span>`;

        return `
          <tr style="vertical-align: middle;">
            <td style="padding: 12px; color: #cbd5e1;">${new Date(p.fecha).toLocaleDateString()} <span style="font-size:0.8rem; color:#64748b; margin-left:4px;">${new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
            <td style="padding: 12px;">${textoAlquiler}</td>
            <td style="padding: 12px;">${methodHtml}</td>
            <td style="padding: 12px; font-weight: bold; color: #10b981; font-size: 1.1rem;">+$${parseFloat(p.monto).toFixed(2)}</td>
            <td style="padding: 12px;">
              <button class="btn btn-sm btn-icon" style="background: #ef4444; color: white; border-radius: 8px;" onclick="window.eliminarPago('${p.id}')" title="Eliminar Pago">
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

  window.eliminarPago = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este pago? (Atención: esto NO descontará automáticamente la deuda de un alquiler, debes ajustarlo manual)')) return;
    try {
      await pagosService.delete(id);
      await loadPagos();
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
      await pagosService.add({
        id_alquiler: document.getElementById('pago-alquiler').value.trim() || null,
        monto: document.getElementById('pago-monto').value,
        metodo: document.getElementById('pago-metodo').value,
        fecha: Date.now()
      });
      form.reset();
      modalNuevo.style.display = 'none';
      await loadPagos();
    } catch (error) {
      alert('Error al registrar el pago');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '💰 Guardar Ingreso';
    }
  });

  // Init filter and load
  loadPagos();
}
