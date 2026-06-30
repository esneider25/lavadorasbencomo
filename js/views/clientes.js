import { clientesService } from '../services/clientesService.js';
import { alquileresService } from '../services/alquileresService.js';

export async function init(db) {
  const contentDiv = document.getElementById('clientes-content');
  
  contentDiv.innerHTML = `
    <!-- CABECERA: Buscador y Botón -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <button id="btn-nuevo-cliente" class="btn btn-primary" style="border-radius: 8px; padding: 10px 20px; font-weight: bold;"><i class="fa-solid fa-user-plus"></i> Nuevo Cliente</button>
      
      <div style="position: relative; flex: 1; min-width: 200px; max-width: 350px;">
        <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 12px; color: #94a3b8;"></i>
        <input type="text" id="cli-buscar" placeholder="Buscar por nombre, tlf o dir..." class="input" style="width: 100%; padding-left: 35px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
      </div>
    </div>

    <!-- MINI RESUMEN (ESTILO PREMIUM) -->
    <div id="mini-resumen-clientes" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
      
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-users"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Total de Clientes</div>
          <strong id="res-cli-total" style="font-size: 1.4rem; color: white;">0</strong>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-user-check"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Nuevos este mes</div>
          <strong id="res-cli-nuevos" style="font-size: 1.4rem; color: white;">0</strong>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); color: #8b5cf6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-hand-holding-dollar"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Clientes Activos (Con Lavadora)</div>
          <strong id="res-cli-activos" style="font-size: 1.4rem; color: white;">0</strong>
        </div>
      </div>

    </div>

    <div class="panel">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Ubicación</th>
              <th>Estado Financiero</th>
              <th>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody id="clientes-tbody">
            <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL NUEVO CLIENTE -->
    <div id="modal-nuevo-cliente" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-nuevo-cliente').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-user-plus" style="color: var(--accent-blue);"></i> Registrar Cliente</h2>
        <form id="form-nuevo-cliente" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="form-group">
            <label class="form-label">Nombre Completo</label>
            <input type="text" id="cli-nombre" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono (WhatsApp)</label>
            <input type="text" id="cli-telefono" placeholder="Ej: 04141234567" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Dirección Exacta</label>
            <input type="text" id="cli-direccion" required class="form-input">
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">💾 Guardar Cliente</button>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR CLIENTE -->
    <div id="modal-editar-cliente" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 450px; max-width: 95%; position: relative;">
        <button onclick="document.getElementById('modal-editar-cliente').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-pen" style="color: #8b5cf6;"></i> Editar Cliente</h2>
        <form id="form-editar-cliente" style="display: flex; flex-direction: column; gap: 20px;">
          <input type="hidden" id="edit-cli-id">
          <div class="form-group">
            <label class="form-label">Nombre Completo</label>
            <input type="text" id="edit-cli-nombre" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono (WhatsApp)</label>
            <input type="text" id="edit-cli-telefono" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Dirección Exacta</label>
            <input type="text" id="edit-cli-direccion" required class="form-input">
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 14px; font-size: 1.1rem; border-radius: 10px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">💾 Guardar Cambios</button>
        </form>
      </div>
    </div>

    <!-- MODAL PERFIL VIP (HISTORIAL) -->
    <div id="modal-perfil-cliente" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 550px; max-width: 95%; position: relative; max-height: 90vh; overflow-y: auto;">
        <button onclick="document.getElementById('modal-perfil-cliente').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Perfil del Cliente</h2>
        <div id="perfil-cli-content" style="display: flex; flex-direction: column; gap: 10px;">
           <p style="text-align: center; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando estadísticas...</p>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById('clientes-tbody');
  const inputBuscar = document.getElementById('cli-buscar');
  
  const modalNuevo = document.getElementById('modal-nuevo-cliente');
  const btnNuevo = document.getElementById('btn-nuevo-cliente');
  const formNuevo = document.getElementById('form-nuevo-cliente');
  
  const modalEditar = document.getElementById('modal-editar-cliente');
  const formEditar = document.getElementById('form-editar-cliente');

  btnNuevo.onclick = () => {
    modalNuevo.style.display = 'flex';
  };

  inputBuscar.addEventListener('input', () => {
    loadClientes();
  });

  async function loadClientes() {
    try {
      let clientes = await clientesService.getAll();
      const alquileres = await alquileresService.getAll();
      
      const total = clientes.length;
      
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).getTime();
      let nuevos = 0;
      clientes.forEach(c => {
        if (c.creado_en >= primerDiaMes) nuevos++;
      });
      
      const clientStats = {};
      let activos = 0;
      const clientesConLavadora = new Set();

      alquileres.forEach(a => {
        if (!a.id_cliente) return;
        
        if (!clientStats[a.id_cliente]) {
           clientStats[a.id_cliente] = { deuda: 0, alquileres: 0 };
        }
        clientStats[a.id_cliente].alquileres++;
        
        let c = parseFloat(a.costo_total || 0);
        let p = parseFloat(a.pagado || 0);
        if (c - p > 0) {
            clientStats[a.id_cliente].deuda += (c - p);
        }

        if (a.estado_logistica !== 'devuelta') {
           clientesConLavadora.add(a.id_cliente);
        }
      });
      activos = clientesConLavadora.size;

      document.getElementById('res-cli-total').textContent = total;
      document.getElementById('res-cli-nuevos').textContent = nuevos;
      document.getElementById('res-cli-activos').textContent = activos;

      const searchTerm = inputBuscar.value.toLowerCase().trim();
      if (searchTerm) {
        clientes = clientes.filter(c => {
          const n = (c.nombre || '').toLowerCase();
          const t = (c.telefono || '').toLowerCase();
          const d = (c.direccion || '').toLowerCase();
          return n.includes(searchTerm) || t.includes(searchTerm) || d.includes(searchTerm);
        });
      }

      if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">No hay clientes registrados.</td></tr>';
        return;
      }

      tbody.innerHTML = clientes.map(c => {
        const stats = clientStats[c.id] || { deuda: 0, alquileres: 0 };
        const avatarColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
        const firstLetter = (c.nombre || 'A').charAt(0).toUpperCase();
        const colorIndex = firstLetter.charCodeAt(0) % avatarColors.length;
        const bgColor = avatarColors[colorIndex];

        // Avatar UI
        let avatarHtml = `
          <div style="display: flex; align-items: center; gap: 12px;">
             <div style="width: 40px; height: 40px; border-radius: 50%; background: ${bgColor}; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.2rem; flex-shrink: 0; text-transform: uppercase;">
                ${firstLetter}
             </div>
             <div>
                <div style="text-transform: capitalize; font-weight: bold; color: white; font-size: 1.05rem; margin-bottom: 2px;">${c.nombre || 'Desconocido'}</div>
                <div style="font-size: 0.85rem; color: #94a3b8;"><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${c.telefono || 'Sin teléfono'}</div>
             </div>
          </div>
        `;

        // Ubicación
        let ubicacionHtml = `
          <div style="display: flex; gap: 8px; align-items: flex-start; max-width: 250px;">
            <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-top: 3px;"></i>
            <span style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.3;">${c.direccion || 'No registrada'}</span>
          </div>
        `;

        // Estado Financiero
        let deudaHtml = '';
        if (stats.deuda > 0) {
           deudaHtml = `<span class="badge badge-danger" style="display: inline-block; margin-bottom: 4px;"><div class="badge-dot"></div>Debe $${stats.deuda.toFixed(2)}</span>`;
        } else {
           deudaHtml = `<span class="badge badge-success" style="display: inline-block; margin-bottom: 4px;"><div class="badge-dot"></div>Solvente</span>`;
        }
        
        let nivelTexto = stats.alquileres >= 5 ? '<i class="fa-solid fa-crown" style="color:#f59e0b;"></i> VIP' : (stats.alquileres >= 1 ? 'Frecuente' : 'Nuevo');
        
        let financieroHtml = `
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
             ${deudaHtml}
             <span style="font-size: 0.8rem; color: #94a3b8;">${stats.alquileres} Alquileres (${nivelTexto})</span>
          </div>
        `;

        let waBtn = '';
        if (c.telefono) {
           let cleanPhone = c.telefono.replace(/\\D/g, '');
           if (cleanPhone.length >= 10) {
             if (cleanPhone.startsWith('0')) {
                cleanPhone = '58' + cleanPhone.substring(1);
             }
             let waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola ' + (c.nombre || '') + ', le contactamos de LavaGestión Pro.')}`;
             waBtn = `<a href="${waUrl}" target="_blank" title="Chatear por WhatsApp" class="btn btn-sm btn-icon" style="background: #25D366; color: white; text-decoration: none; border-radius: 8px; padding: 6px 10px;"><i class="fa-brands fa-whatsapp"></i></a>`;
           }
        }

        let actionButtons = `
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-icon" style="background: #3b82f6; color: white; border-radius: 8px; padding: 6px 10px;" onclick="window.verPerfilCliente('${c.id}', '${c.nombre || ''}')" title="Ver Perfil e Historial">
              <i class="fa-solid fa-chart-line"></i>
            </button>
            ${waBtn}
            <button class="btn btn-sm btn-icon" style="background: #8b5cf6; color: white; border-radius: 8px; padding: 6px 10px;" onclick="window.abrirEditarCliente('${c.id}', '${c.nombre || ''}', '${c.telefono || ''}', '${c.direccion || ''}')" title="Editar Datos">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-icon" style="background: #ef4444; color: white; border-radius: 8px; padding: 6px 10px;" onclick="window.eliminarCliente('${c.id}')" title="Eliminar Cliente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;

        return `
          <tr style="vertical-align: middle;">
            <td style="padding: 12px;">${avatarHtml}</td>
            <td style="padding: 12px;">${ubicacionHtml}</td>
            <td style="padding: 12px;">${financieroHtml}</td>
            <td style="padding: 12px;">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error("Error cargando clientes:", error);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.eliminarCliente = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este cliente? Se borrará permanentemente.')) return;
    try {
      await clientesService.delete(id);
      await loadClientes();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  window.abrirEditarCliente = (id, nombre, telefono, direccion) => {
    document.getElementById('edit-cli-id').value = id;
    document.getElementById('edit-cli-nombre').value = nombre;
    document.getElementById('edit-cli-telefono').value = telefono;
    document.getElementById('edit-cli-direccion').value = direccion;
    modalEditar.style.display = 'flex';
  };

  window.verPerfilCliente = async (id, nombre) => {
    const modal = document.getElementById('modal-perfil-cliente');
    const content = document.getElementById('perfil-cli-content');
    modal.style.display = 'flex';
    content.innerHTML = '<p style="text-align: center; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Consultando base de datos...</p>';

    try {
      const todosAlquileres = await alquileresService.getAll();
      const alquileresCliente = todosAlquileres.filter(a => a.id_cliente === id);
      
      let totalGastado = 0;
      let totalDeuda = 0;

      alquileresCliente.forEach(a => {
        let costo = parseFloat(a.costo_total || 0);
        let pagado = parseFloat(a.pagado || 0);
        totalGastado += pagado;
        if ((costo - pagado) > 0) {
            totalDeuda += (costo - pagado);
        }
      });

      alquileresCliente.sort((a, b) => (b.fecha_inicio || 0) - (a.fecha_inicio || 0));
      const ultimos5 = alquileresCliente.slice(0, 5);
      
      let tablaUltimos = '';
      if (ultimos5.length > 0) {
         tablaUltimos = `
           <h4 style="color: #cbd5e1; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Últimos Alquileres</h4>
           <table style="width: 100%; font-size: 0.85rem; color: #94a3b8; text-align: left; border-collapse: collapse;">
             <thead>
               <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                 <th style="padding: 5px 0;">Fecha</th>
                 <th style="padding: 5px 0;">Lavadora</th>
                 <th style="padding: 5px 0; text-align: right;">Costo Total</th>
                 <th style="padding: 5px 0; text-align: right;">Deuda</th>
               </tr>
             </thead>
             <tbody>
               ${ultimos5.map(al => {
                 let c = parseFloat(al.costo_total || 0);
                 let p = parseFloat(al.pagado || 0);
                 let d = c - p;
                 let dHtml = d > 0 ? `<span style="color: #ef4444;">$${d.toFixed(2)}</span>` : `<span style="color: #10b981;">Solvente</span>`;
                 return `
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                   <td style="padding: 5px 0;">${al.fecha_inicio ? new Date(al.fecha_inicio).toLocaleDateString() : 'N/A'}</td>
                   <td style="padding: 5px 0;" class="text-mono">${al.id_lavadora || 'N/A'}</td>
                   <td style="padding: 5px 0; text-align: right;">$${c.toFixed(2)}</td>
                   <td style="padding: 5px 0; text-align: right;">${dHtml}</td>
                 </tr>
                 `;
               }).join('')}
             </tbody>
           </table>
         `;
      } else {
         tablaUltimos = '<p style="color: #94a3b8; font-size: 0.85rem; margin-top: 10px;">Este cliente aún no tiene alquileres registrados.</p>';
      }

      let badgeNivel = '';
      if (alquileresCliente.length >= 5) {
          badgeNivel = `<span class="badge badge-success" style="font-size: 0.8rem;"><i class="fa-solid fa-crown"></i> Cliente VIP</span>`;
      } else if (alquileresCliente.length >= 1) {
          badgeNivel = `<span class="badge badge-info" style="font-size: 0.8rem;">Cliente Frecuente</span>`;
      } else {
          badgeNivel = `<span class="badge badge-neutral" style="font-size: 0.8rem;">Nuevo</span>`;
      }

      let alertaDeuda = totalDeuda > 0 
        ? `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center; font-weight: bold;"><i class="fa-solid fa-triangle-exclamation"></i> ¡Atención! Este cliente tiene una deuda de $${totalDeuda.toFixed(2)}</div>`
        : `<div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center; font-weight: bold;"><i class="fa-solid fa-check-double"></i> Cliente 100% Solvente</div>`;

      content.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center; margin-bottom: 10px;">
          <h3 style="color: var(--text-primary); margin: 0 0 5px 0; font-size: 1.4rem; text-transform: capitalize;">${nombre}</h3>
          ${badgeNivel}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 1.8rem; color: #10b981; font-weight: bold;">$${totalGastado.toFixed(2)}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Dinero Pagado</div>
          </div>
          
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 1.8rem; color: #3b82f6; font-weight: bold;">${alquileresCliente.length}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Alquileres Totales</div>
          </div>
        </div>

        ${alertaDeuda}
        ${tablaUltimos}
      `;

    } catch(e) {
      content.innerHTML = '<p style="color: #ef4444; text-align: center;">Error al cargar el perfil del cliente.</p>';
    }
  };

  formNuevo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formNuevo.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await clientesService.add({
        nombre: document.getElementById('cli-nombre').value.trim(),
        telefono: document.getElementById('cli-telefono').value.trim(),
        direccion: document.getElementById('cli-direccion').value.trim()
      });
      formNuevo.reset();
      modalNuevo.style.display = 'none';
      await loadClientes();
    } catch (error) {
      alert('Error al guardar el cliente');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '💾 Guardar Cliente';
    }
  });

  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEditar.querySelector('button');
    const id = document.getElementById('edit-cli-id').value;

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await clientesService.update(id, {
        nombre: document.getElementById('edit-cli-nombre').value.trim(),
        telefono: document.getElementById('edit-cli-telefono').value.trim(),
        direccion: document.getElementById('edit-cli-direccion').value.trim()
      });
      document.getElementById('modal-editar-cliente').style.display = 'none';
      await loadClientes();
    } catch (error) {
      alert('Error al actualizar el cliente');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '💾 Guardar Cambios';
    }
  });

  loadClientes();
}
