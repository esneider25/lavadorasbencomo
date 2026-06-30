import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';
import { pagosService } from '../services/pagosService.js';
import { telegramService } from '../services/telegramService.js';

export async function init(db) {
  const contentDiv = document.getElementById('alquileres-content');
  
  contentDiv.innerHTML = `
    <!-- TABS Y BUSCADOR -->
    <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="display: flex; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px;">
        <button id="tab-activos" style="background: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">Activos / En Proceso</button>
        <button id="tab-completados" style="background: transparent; color: #94a3b8; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s;">Historial Completados</button>
      </div>
      <div style="position: relative;">
        <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 12px; color: #94a3b8;"></i>
        <input type="text" id="alq-buscar" placeholder="Buscar cliente o lavadora..." class="input" style="width: 250px; padding-left: 35px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
      </div>
    </div>

    <!-- MINI RESUMEN (TARJETAS) -->
    <div id="mini-resumen" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-jug-detergent"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Lavadoras en Calle</div>
          <strong id="res-lavadoras" style="font-size: 1.3rem; color: white;">0</strong>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; display: flex; justify-content: center; align-items: center; font-size: 1.3rem;">
          <i class="fa-solid fa-money-bill-trend-up"></i>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px;">Dinero por Cobrar</div>
          <strong id="res-deuda" style="font-size: 1.3rem; color: white;">$0.00</strong>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Lavadora</th>
              <th>Cliente</th>
              <th>Tiempos</th>
              <th>Logística</th>
              <th>Pagos / Deuda</th>
              <th>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody id="alquileres-tbody">
            <tr><td colspan="6" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CREAR ALQUILER -->
    <div id="modal-nuevo-alquiler" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 550px; max-width: 95%; position: relative; max-height: 90vh; overflow-y: auto;">
        <button onclick="document.getElementById('modal-nuevo-alquiler').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
        
        <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-file-contract" style="color: var(--accent-blue);"></i> Nuevo Alquiler</h2>
        
        <form id="form-alquileres" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Cliente</label>
            <select id="alq-cliente" required class="form-select">
              <option value="" disabled selected>Seleccione un Cliente...</option>
            </select>
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Lavadora</label>
            <select id="alq-lavadora" required class="form-select">
              <option value="" disabled selected>Seleccione una Lavadora...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Días</label>
            <input type="number" id="alq-dias" placeholder="Ej: 30" required class="form-input">
          </div>
          
          <div class="form-group">
            <label class="form-label">Costo Total ($)</label>
            <input type="number" id="alq-costo" placeholder="0.00" required class="form-input" step="0.01">
          </div>
          
          <div class="form-group">
            <label class="form-label"><i class="fa-regular fa-clock"></i> Hora Entrega</label>
            <input type="time" id="alq-hora" required class="form-input">
          </div>
          
          <div class="form-group">
            <label class="form-label"><i class="fa-regular fa-clock"></i> Hora Retiro</label>
            <input type="time" id="alq-hora-retiro" required class="form-input">
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label"><i class="fa-solid fa-truck"></i> Chofer Asignado</label>
            <input type="text" id="alq-repartidor" placeholder="Nombre del chofer" required class="form-input">
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label"><i class="fa-solid fa-pen-to-square"></i> Notas Adicionales (Opcional)</label>
            <input type="text" id="alq-notas" placeholder="Ej: Llamar antes de llegar" class="form-input">
          </div>

          <div style="grid-column: span 2; margin-top: 10px;">
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.1rem; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px;">🚀 Iniciar Alquiler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE PAGO -->
    <div id="modal-pago" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 400px; max-width: 90%; position: relative;">
        <button onclick="document.getElementById('modal-pago').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
        <h3 style="margin-top: 0;"><i class="fa-solid fa-money-bill-wave" style="color: #10b981;"></i> Registrar Pago</h3>
        <p id="modal-deuda-text" style="color: #cbd5e1; margin-bottom: 20px;">Deuda actual: $0</p>
        
        <form id="form-pago-modal" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="hidden" id="pago-alquiler-id">
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Monto a pagar ($)</label>
            <input type="number" id="pago-monto" required class="input" style="width: 100%; padding: 10px;" step="0.01">
          </div>
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Método de Pago</label>
            <select id="pago-metodo" required class="input" style="width: 100%; padding: 10px;">
              <option value="pago_movil">Pago Móvil</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo_usd">Efectivo USD</option>
              <option value="efectivo_bs">Efectivo Bs</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="background: #10b981; margin-top: 10px; padding: 10px;">Guardar Pago</button>
        </form>
      </div>
    </div>

    <!-- MODAL DE RENOVAR -->
    <div id="modal-renovar" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 400px; max-width: 90%; position: relative;">
        <button onclick="document.getElementById('modal-renovar').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
        <h3 style="margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-arrows-rotate"></i> Renovar Alquiler</h3>
        <p style="color: #cbd5e1; margin-bottom: 20px;">Añade más días a este alquiler en curso.</p>
        
        <form id="form-renovar-modal" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="hidden" id="renovar-alquiler-id">
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Días Extra a sumar</label>
            <input type="number" id="renovar-dias" required class="input" style="width: 100%; padding: 10px;" min="1" value="1">
          </div>
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Costo Extra a sumar ($)</label>
            <input type="number" id="renovar-costo" required class="input" style="width: 100%; padding: 10px;" step="0.01" value="0">
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 10px; padding: 10px;">Renovar</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('form-alquileres');
  const tbody = document.getElementById('alquileres-tbody');
  const selectCliente = document.getElementById('alq-cliente');
  const selectLavadora = document.getElementById('alq-lavadora');
  
  const tabActivos = document.getElementById('tab-activos');
  const tabCompletados = document.getElementById('tab-completados');
  let currentTab = 'activos';
  
  const inputBuscar = document.getElementById('alq-buscar');
  const miniResumen = document.getElementById('mini-resumen');
  const resLavadoras = document.getElementById('res-lavadoras');
  const resDeuda = document.getElementById('res-deuda');

  // Modal Nuevo Alquiler
  const modalNuevoAlquiler = document.getElementById('modal-nuevo-alquiler');
  const btnNuevoAlquiler = document.getElementById('btn-nuevo-alquiler');
  if (btnNuevoAlquiler) {
    btnNuevoAlquiler.onclick = () => {
      modalNuevoAlquiler.style.display = 'flex';
    };
  }

  // Modal Pago
  const modalPago = document.getElementById('modal-pago');
  const formPago = document.getElementById('form-pago-modal');
  const inputPagoId = document.getElementById('pago-alquiler-id');
  const inputPagoMonto = document.getElementById('pago-monto');
  const modalDeudaText = document.getElementById('modal-deuda-text');

  // Modal Renovar
  const modalRenovar = document.getElementById('modal-renovar');
  const formRenovar = document.getElementById('form-renovar-modal');
  const inputRenovarId = document.getElementById('renovar-alquiler-id');
  const inputRenovarDias = document.getElementById('renovar-dias');
  const inputRenovarCosto = document.getElementById('renovar-costo');

  tabActivos.addEventListener('click', () => {
    currentTab = 'activos';
    tabActivos.style.background = 'var(--accent-blue)';
    tabActivos.style.color = 'white';
    tabCompletados.style.background = 'rgba(255,255,255,0.1)';
    tabCompletados.style.color = '#cbd5e1';
    miniResumen.style.display = 'flex';
    loadAlquileres();
  });

  tabCompletados.addEventListener('click', () => {
    currentTab = 'completados';
    tabCompletados.style.background = 'var(--accent-blue)';
    tabCompletados.style.color = 'white';
    tabActivos.style.background = 'rgba(255,255,255,0.1)';
    tabActivos.style.color = '#cbd5e1';
    miniResumen.style.display = 'none';
    loadAlquileres();
  });

  inputBuscar.addEventListener('input', () => {
    loadAlquileres();
  });

  async function loadSelects() {
    try {
      const clientes = await clientesService.getAll('nombre', 'asc');
      selectCliente.innerHTML = '<option value="" disabled selected>Seleccione un Cliente</option>' + 
        clientes.map(c => `<option value="${c.id}" data-direccion="${c.direccion || ''}" data-telefono="${c.telefono || ''}">${c.nombre}</option>`).join('');

      const lavadoras = await lavadorasService.getDisponibles();
      selectLavadora.innerHTML = '<option value="" disabled selected>Seleccione una Lavadora</option>' + 
        lavadoras.map(l => `<option value="${l.serial}">Serial: ${l.serial} - ${l.modelo}</option>`).join('');
    } catch (e) {
      console.error("Error cargando selects:", e);
    }
  }

  async function loadAlquileres() {
    try {
      let alquileres = await alquileresService.getAll();
      const searchTerm = inputBuscar.value.toLowerCase().trim();
      
      // Filtrar por texto
      if (searchTerm) {
        alquileres = alquileres.filter(a => {
          const cliName = (a.clienteNombre || '').toLowerCase();
          const lavId = (a.id_lavadora || '').toLowerCase();
          return cliName.includes(searchTerm) || lavId.includes(searchTerm);
        });
      }
      
      // Filtrar por pestaña y calcular mini resumen
      let totalLavadorasActivas = 0;
      let totalDeudaActiva = 0;

      if (currentTab === 'activos') {
        alquileres = alquileres.filter(a => {
          if (a.estado_logistica !== 'devuelta') {
            totalLavadorasActivas++;
            let cTotal = parseFloat(a.costo_total || 0);
            let cPagado = parseFloat(a.pagado || 0);
            if ((cTotal - cPagado) > 0) totalDeudaActiva += (cTotal - cPagado);
            return true;
          }
          return false;
        });
        alquileres.sort((a, b) => b.fecha_inicio - a.fecha_inicio);
        
        resLavadoras.textContent = totalLavadorasActivas;
        resDeuda.textContent = '$' + totalDeudaActiva.toFixed(2);
      } else {
        alquileres = alquileres.filter(a => a.estado_logistica === 'devuelta');
        alquileres.sort((a, b) => b.fecha_fin_real - a.fecha_fin_real);
      }

      if (alquileres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 30px;">No hay resultados encontrados.</td></tr>`;
        return;
      }

      tbody.innerHTML = alquileres.map(a => {
        let estadoLogistica = a.estado_logistica || 'entregada';
        let logBadgeColor = 'neutral';
        let logBadgeText = estadoLogistica;
        let actionButtons = '';
        let repartidorLabel = a.repartidor ? `<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;"><i class="fa-solid fa-user-astronaut"></i> ${a.repartidor}</div>` : '';
        
        // --- WhatsApp Logic ---
        let telFormat = '';
        if (a.clienteTelefono) {
           let cleanPhone = a.clienteTelefono.replace(/\\D/g, '');
           if (cleanPhone.length >= 10) {
             if (cleanPhone.startsWith('0')) {
                cleanPhone = '58' + cleanPhone.substring(1);
             }
             let waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola ' + (a.clienteNombre || '') + ', te contactamos de Lavadoras Bencomo.')}`;
             telFormat = `<a href="${waUrl}" target="_blank" title="Escribir por WhatsApp" style="color: #25D366; margin-left: 5px; font-size: 1.2em; text-decoration: none;"><i class="fa-brands fa-whatsapp"></i></a>`;
           }
        }
        
        let direccionHtml = a.clienteDireccion ? `<br><small style="color: #94a3b8;"><i class="fa-solid fa-location-dot"></i> ${a.clienteDireccion}</small>` : '';
        let notasHtml = a.notas ? `<div style="font-size: 0.8rem; background: rgba(59, 130, 246, 0.1); border-left: 2px solid #3b82f6; padding: 4px 6px; margin-top: 6px; color: #cbd5e1; border-radius: 0 4px 4px 0;"><i class="fa-solid fa-pen-to-square"></i> ${a.notas}</div>` : '';

        // --- Tiempos y Fechas ---
        const formatAMPM = (timeStr) => {
          if (!timeStr) return '';
          let [h, m] = timeStr.split(':');
          h = parseInt(h);
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          h = h ? h : 12; 
          return `${h}:${m} ${ampm}`;
        };

        let fecha = new Date(a.fecha_inicio).toLocaleDateString();
        let horaEntregaStr = a.hora_entrega ? ` ${formatAMPM(a.hora_entrega)}` : '';
        let horaRetiroStr = a.hora_retiro ? ` ${formatAMPM(a.hora_retiro)}` : (horaEntregaStr);
        
        let diasN = parseInt(a.dias) || 0;
        let msVencimiento = a.fecha_inicio + (diasN * 86400000);
        let fechaVenceStr = new Date(msVencimiento).toLocaleDateString();

        let tiemposHtml = `
          <div style="font-size: 0.85rem; display: flex; flex-wrap: wrap; gap: 10px;">
            <div style="color: #cbd5e1;" title="Inicio y Entrega"><i class="fa-solid fa-play" style="color:#3b82f6;"></i> ${fecha}${horaEntregaStr}</div>
            <div style="color: #ef4444;" title="Vencimiento y Retiro"><i class="fa-solid fa-stop" style="color:#ef4444;"></i> ${fechaVenceStr}${horaRetiroStr}</div>
          </div>
        `;

        if (a.estado_alquiler === 'activo') {
          if (estadoLogistica === 'entrega_pendiente') {
            logBadgeColor = 'warning'; logBadgeText = 'Entrega Pendiente';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #f59e0b; color: white;" onclick="window.cambiarLogistica('${a.id}', 'entrega_en_ruta')">🚗 Despachar</button>`;
          } else if (estadoLogistica === 'entrega_en_ruta') {
            logBadgeColor = 'info'; logBadgeText = 'En Ruta a Cliente';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #3b82f6; color: white;" onclick="window.cambiarLogistica('${a.id}', 'entregada')">✅ Entregada</button>`;
          } else if (estadoLogistica === 'entregada') {
            logBadgeColor = 'success'; logBadgeText = 'En Uso';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #ef4444; color: white;" onclick="window.finalizarAlquiler('${a.id}', '${a.id_lavadora}')">🛑 Finalizar</button>`;
          }
          
          // Botón de Renovar
          actionButtons += `<button class="btn btn-sm btn-primary" style="flex: 1;" onclick="window.abrirModalRenovar('${a.id}', ${a.dias}, ${a.costo_total})"><i class="fa-solid fa-arrows-rotate"></i> Renovar</button>`;
          
        } else {
          if (estadoLogistica === 'recogida_pendiente') {
            logBadgeColor = 'warning'; logBadgeText = 'Recogida Pendiente';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #f59e0b; color: white;" onclick="window.cambiarLogistica('${a.id}', 'recogida_en_ruta')">🚚 Buscar</button>`;
          } else if (estadoLogistica === 'recogida_en_ruta') {
            logBadgeColor = 'info'; logBadgeText = 'Regresando';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #10b981; color: white;" onclick="window.marcarDevuelta('${a.id}', '${a.id_lavadora}')">🏠 En Almacén</button>`;
          } else {
            logBadgeColor = 'neutral'; logBadgeText = 'Completado';
            actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #ef4444; color: white;" onclick="window.eliminarRegistro('${a.id}')"><i class="fa-solid fa-trash"></i> Eliminar</button>`;
          }
        }

        // --- Lógica Financiera (Pagos) ---
        let costoTotal = parseFloat(a.costo_total || 0);
        let pagado = parseFloat(a.pagado || 0);
        let deuda = costoTotal - pagado;
        
        let pagoBadgeColor = 'neutral';
        let pagoBadgeText = '';
        
        if (costoTotal === 0) {
           pagoBadgeText = 'Gratis / N/A';
        } else if (deuda <= 0) {
           pagoBadgeColor = 'success'; pagoBadgeText = 'Pagado';
        } else if (pagado > 0) {
           pagoBadgeColor = 'warning'; pagoBadgeText = 'Abono';
        } else {
           pagoBadgeColor = 'danger'; pagoBadgeText = 'Debe';
        }

        let infoPagoHtml = `
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <div style="font-weight: bold; color: #f8fafc;">$${pagado} / $${costoTotal}</div>
            <span class="badge badge-${pagoBadgeColor}">${pagoBadgeText}</span>
          </div>
        `;

        if (deuda > 0) {
           actionButtons += `<button class="btn btn-sm" style="flex: 1; background: #10b981; color: white;" onclick="window.abrirModalPago('${a.id}', ${deuda})">💸 Cobrar $${deuda}</button>`;
        }

        return `
        <tr>
          <td class="text-mono" style="padding-bottom: 0;">${a.id_lavadora}</td>
          <td>
            <strong>${a.clienteNombre || a.id_cliente}</strong> ${telFormat}
            ${direccionHtml}
            ${notasHtml}
            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 4px;">${a.dias} días totales</div>
          </td>
          <td style="padding-top: 0; padding-bottom: 0;">${tiemposHtml}</td>
          <td style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span class="badge badge-${logBadgeColor}"><div class="badge-dot"></div>${logBadgeText}</span>
            ${repartidorLabel}
          </td>
          <td style="padding-top: 0; padding-bottom: 4px;">${infoPagoHtml}</td>
          <td style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 5px;">${actionButtons}</td>
        </tr>
      `}).join('');
    } catch (error) {
      console.error("Error cargando alquileres:", error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
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
    if (!confirm('¿Marcar para recogida?')) return;
    try {
      await alquileresService.finalizar(idAlquiler);
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.marcarDevuelta = async (idAlquiler, idLavadora) => {
    try {
      await alquileresService.update(idAlquiler, { estado_logistica: 'devuelta' });
      await lavadorasService.cambiarEstado(idLavadora, 'disponible');
      await loadAlquileres();
      await loadSelects(); 
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.eliminarRegistro = async (idAlquiler) => {
    if (!confirm('¿Eliminar del historial?')) return;
    try {
      await alquileresService.delete(idAlquiler);
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // --- Modal de Pago ---
  window.abrirModalPago = (id, deudaActual) => {
    inputPagoId.value = id;
    inputPagoMonto.value = deudaActual;
    modalDeudaText.textContent = `Faltan por cobrar: $${deudaActual}`;
    modalPago.style.display = 'flex';
  };

  formPago.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formPago.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
      const idAlquiler = inputPagoId.value;
      const monto = parseFloat(inputPagoMonto.value);
      const metodo = document.getElementById('pago-metodo').value;

      await pagosService.add({
        id_alquiler: idAlquiler,
        monto: monto,
        metodo: metodo,
        fecha: Date.now()
      });

      const alquilerSnapshot = await alquileresService.getAll(); 
      const alqData = alquilerSnapshot.find(x => x.id === idAlquiler);
      const nuevoPagado = (parseFloat(alqData.pagado) || 0) + monto;
      
      await alquileresService.update(idAlquiler, { pagado: nuevoPagado });

      modalPago.style.display = 'none';
      await loadAlquileres();
    } catch (error) {
      alert('Error al registrar pago');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar Pago';
    }
  });

  // --- Modal de Renovar ---
  window.abrirModalRenovar = async (id, diasActuales, costoActual) => {
    inputRenovarId.value = id;
    inputRenovarDias.value = 1; // Por defecto renovamos 1 día
    inputRenovarCosto.value = 0; // Por defecto que decidan cuánto extra van a cobrar
    modalRenovar.style.display = 'flex';
  };

  formRenovar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formRenovar.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Renovando...';
    try {
      const idAlquiler = inputRenovarId.value;
      const diasExtra = parseInt(inputRenovarDias.value);
      const costoExtra = parseFloat(inputRenovarCosto.value);

      const alquilerSnapshot = await alquileresService.getAll(); 
      const alqData = alquilerSnapshot.find(x => x.id === idAlquiler);
      
      const nuevosDias = (parseInt(alqData.dias) || 0) + diasExtra;
      const nuevoCosto = (parseFloat(alqData.costo_total) || 0) + costoExtra;

      await alquileresService.update(idAlquiler, { 
        dias: nuevosDias, 
        costo_total: nuevoCosto 
      });

      modalRenovar.style.display = 'none';
      await loadAlquileres();
    } catch (error) {
      alert('Error al renovar alquiler');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Renovar';
    }
  });

  // Lógica de nuevo alquiler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '...';

    try {
      const idLavadora = selectLavadora.value;
      const clienteId = selectCliente.value;
      const selectedOption = selectCliente.options[selectCliente.selectedIndex];
      const clienteText = selectedOption.text;
      const direccionCli = selectedOption.getAttribute('data-direccion');
      const telefonoCli = selectedOption.getAttribute('data-telefono');
      
      const repartidorVal = document.getElementById('alq-repartidor').value;
      const horaVal = document.getElementById('alq-hora').value;
      const horaRetiroVal = document.getElementById('alq-hora-retiro').value;
      const costoVal = document.getElementById('alq-costo').value;
      const notasVal = document.getElementById('alq-notas').value;

      await alquileresService.add({
        id_cliente: clienteId,
        clienteNombre: clienteText,
        clienteDireccion: direccionCli,
        clienteTelefono: telefonoCli,
        id_lavadora: idLavadora,
        dias: document.getElementById('alq-dias').value,
        costo_total: parseFloat(costoVal),
        pagado: 0, 
        repartidor: repartidorVal,
        hora_entrega: horaVal,
        hora_retiro: horaRetiroVal,
        notas: notasVal,
        estado_alquiler: 'activo',
        estado_logistica: 'entrega_pendiente',
        fecha_inicio: Date.now()
      });

      await lavadorasService.cambiarEstado(idLavadora, 'alquilada');

      form.reset();
      modalNuevoAlquiler.style.display = 'none';
      await loadSelects();
      await loadAlquileres();
    } catch (error) {
      alert('Error al guardar');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🚀 Iniciar Alquiler';
    }
  });

  loadSelects();
  loadAlquileres();

  // --- TELEGRAM WATCHER (RELOJ VIGILANTE) ---
  // Se ejecuta cada 60 segundos (60000 ms)
  setInterval(async () => {
    const token = localStorage.getItem('tg_bot_token');
    const chatId = localStorage.getItem('tg_chat_id');
    if (!token || !chatId) return; // Si no hay configuración, no hace nada

    try {
      const alquileres = await alquileresService.getAll();
      // Filtrar alquileres activos, que estén en uso (entregada), y que NO hayan sido notificados aún
      const activos = alquileres.filter(a => a.estado_alquiler === 'activo' && a.estado_logistica === 'entregada' && !a.notificado_telegram);
      
      const ahora = Date.now();
      
      for (const alq of activos) {
        let diasN = parseInt(alq.dias) || 0;
        let msVencimiento = alq.fecha_inicio + (diasN * 86400000);
        
        // Ajustar la hora exacta de retiro si está definida
        if (alq.hora_retiro) {
          const [h, m] = alq.hora_retiro.split(':');
          const vDate = new Date(msVencimiento);
          vDate.setHours(parseInt(h), parseInt(m), 0, 0);
          msVencimiento = vDate.getTime();
        }

        const msRestantes = msVencimiento - ahora;
        const minsRestantes = Math.floor(msRestantes / 60000);

        // Si faltan 60 minutos o menos (incluso si ya se pasó a números negativos)
        if (minsRestantes <= 60) {
           const success = await telegramService.sendAlertaRecogida(
             token, 
             chatId, 
             alq.id_lavadora, 
             alq.clienteNombre || 'Cliente', 
             alq.clienteDireccion || 'Dirección no registrada', 
             minsRestantes
           );
           
           if (success) {
             // Marcar en la base de datos para no volver a notificar este mismo alquiler
             await alquileresService.update(alq.id, { notificado_telegram: true });
           }
        }
      }
    } catch (e) {
      console.error('Error en vigilante Telegram:', e);
    }
  }, 60000);
}
