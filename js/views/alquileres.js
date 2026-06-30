import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';
import { pagosService } from '../services/pagosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('alquileres-content');
  
  contentDiv.innerHTML = `
    <div class="panel" style="margin-bottom: 20px;">
      <h3>Crear Nuevo Alquiler</h3>
      <form id="form-alquileres" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <select id="alq-cliente" required class="input" style="flex: 1; min-width: 150px;">
          <option value="" disabled selected>Cargando clientes...</option>
        </select>
        <select id="alq-lavadora" required class="input" style="width: 150px;">
          <option value="" disabled selected>Lavadoras...</option>
        </select>
        <input type="number" id="alq-dias" placeholder="Días" required class="input" style="width: 70px;">
        <input type="number" id="alq-costo" placeholder="Costo Total ($)" required class="input" style="width: 120px;" step="0.01">
        <input type="time" id="alq-hora" required class="input" style="width: 110px;" title="Hora de entrega">
        <input type="text" id="alq-repartidor" placeholder="Chofer" required class="input" style="flex: 1; min-width: 120px;">
        <button type="submit" class="btn btn-primary">Iniciar</button>
      </form>
    </div>

    <!-- TABS Y BUSCADOR -->
    <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" id="tab-activos">Activos / En Proceso</button>
        <button class="btn" style="background: rgba(255,255,255,0.1); color: #cbd5e1;" id="tab-completados">Historial Completados</button>
      </div>
      <div>
        <input type="text" id="alq-buscar" placeholder="🔍 Buscar cliente o lavadora..." class="input" style="width: 250px;">
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

    <!-- MODAL DE PAGO (Oculto por defecto) -->
    <div id="modal-pago" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
      <div class="panel" style="width: 400px; max-width: 90%; position: relative;">
        <button onclick="document.getElementById('modal-pago').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
        <h3 style="margin-top: 0;"><i class="fa-solid fa-money-bill-wave" style="color: #10b981;"></i> Registrar Pago</h3>
        <p id="modal-deuda-text" style="color: #cbd5e1; margin-bottom: 20px;">Deuda actual: $0</p>
        
        <form id="form-pago-modal" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="hidden" id="pago-alquiler-id">
          
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Monto a pagar ($)</label>
            <input type="number" id="pago-monto" required class="input" style="width: 100%;" step="0.01">
          </div>
          
          <div>
            <label style="font-size: 0.9rem; color: #94a3b8; display: block; margin-bottom: 5px;">Método de Pago</label>
            <select id="pago-metodo" required class="input" style="width: 100%;">
              <option value="pago_movil">Pago Móvil</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo_usd">Efectivo USD</option>
              <option value="efectivo_bs">Efectivo Bs</option>
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary" style="background: #10b981; margin-top: 10px;">Guardar Pago</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('form-alquileres');
  const tbody = document.getElementById('alquileres-tbody');
  const selectCliente = document.getElementById('alq-cliente');
  const selectLavadora = document.getElementById('alq-lavadora');
  
  // Pestañas
  const tabActivos = document.getElementById('tab-activos');
  const tabCompletados = document.getElementById('tab-completados');
  let currentTab = 'activos'; // 'activos' o 'completados'
  
  // Buscador
  const inputBuscar = document.getElementById('alq-buscar');

  // Modal
  const modalPago = document.getElementById('modal-pago');
  const formPago = document.getElementById('form-pago-modal');
  const inputPagoId = document.getElementById('pago-alquiler-id');
  const inputPagoMonto = document.getElementById('pago-monto');
  const modalDeudaText = document.getElementById('modal-deuda-text');

  tabActivos.addEventListener('click', () => {
    currentTab = 'activos';
    tabActivos.style.background = 'var(--accent-blue)';
    tabActivos.style.color = 'white';
    tabCompletados.style.background = 'rgba(255,255,255,0.1)';
    tabCompletados.style.color = '#cbd5e1';
    loadAlquileres();
  });

  tabCompletados.addEventListener('click', () => {
    currentTab = 'completados';
    tabCompletados.style.background = 'var(--accent-blue)';
    tabCompletados.style.color = 'white';
    tabActivos.style.background = 'rgba(255,255,255,0.1)';
    tabActivos.style.color = '#cbd5e1';
    loadAlquileres();
  });

  inputBuscar.addEventListener('input', () => {
    loadAlquileres();
  });

  // Cargar selects
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
      
      // Filtrar por pestaña
      if (currentTab === 'activos') {
        alquileres = alquileres.filter(a => a.estado_logistica !== 'devuelta');
        alquileres.sort((a, b) => b.fecha_inicio - a.fecha_inicio);
      } else {
        alquileres = alquileres.filter(a => a.estado_logistica === 'devuelta');
        alquileres.sort((a, b) => b.fecha_fin_real - a.fecha_fin_real);
      }

      if (alquileres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 30px;">No hay resultados encontrados.</td></tr>`;
        return;
      }

      tbody.innerHTML = alquileres.map(a => {
        // --- Lógica Logística ---
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
             let waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola ' + (a.clienteNombre || '') + ', te contactamos de LavaGestión Pro.')}`;
             telFormat = `<a href="${waUrl}" target="_blank" title="Escribir por WhatsApp" style="color: #25D366; margin-left: 5px; font-size: 1.2em; text-decoration: none;"><i class="fa-brands fa-whatsapp"></i></a>`;
           }
        }
        
        let direccionHtml = a.clienteDireccion ? `<br><small style="color: #94a3b8;"><i class="fa-solid fa-location-dot"></i> ${a.clienteDireccion}</small>` : '';

        // --- Tiempos y Fechas ---
        let fecha = new Date(a.fecha_inicio).toLocaleDateString();
        let hora = a.hora_entrega ? ` ${a.hora_entrega}` : '';
        
        let diasN = parseInt(a.dias) || 0;
        let msVencimiento = a.fecha_inicio + (diasN * 86400000);
        let fechaVenceStr = new Date(msVencimiento).toLocaleDateString();

        let tiemposHtml = `
          <div style="font-size: 0.85rem;">
            <div style="color: #cbd5e1; margin-bottom: 3px;" title="Inicio y Entrega"><i class="fa-solid fa-play" style="color:#3b82f6; width:15px;"></i> ${fecha}${hora}</div>
            <div style="color: #ef4444;" title="Vencimiento"><i class="fa-solid fa-stop" style="color:#ef4444; width:15px;"></i> ${fechaVenceStr}</div>
          </div>
        `;

        if (a.estado_alquiler === 'activo') {
          if (estadoLogistica === 'entrega_pendiente') {
            logBadgeColor = 'warning'; logBadgeText = 'Entrega Pendiente';
            actionButtons += `<button class="btn btn-sm" style="background: #f59e0b; color: white; width: 100%; margin-bottom: 5px;" onclick="window.cambiarLogistica('${a.id}', 'entrega_en_ruta')">🚗 Despachar</button>`;
          } else if (estadoLogistica === 'entrega_en_ruta') {
            logBadgeColor = 'info'; logBadgeText = 'En Ruta a Cliente';
            actionButtons += `<button class="btn btn-sm" style="background: #3b82f6; color: white; width: 100%; margin-bottom: 5px;" onclick="window.cambiarLogistica('${a.id}', 'entregada')">✅ Entregada</button>`;
          } else if (estadoLogistica === 'entregada') {
            logBadgeColor = 'success'; logBadgeText = 'En Uso';
            actionButtons += `<button class="btn btn-sm" style="background: #ef4444; color: white; width: 100%; margin-bottom: 5px;" onclick="window.finalizarAlquiler('${a.id}', '${a.id_lavadora}')">🛑 Finalizar</button>`;
          }
        } else {
          if (estadoLogistica === 'recogida_pendiente') {
            logBadgeColor = 'warning'; logBadgeText = 'Recogida Pendiente';
            actionButtons += `<button class="btn btn-sm" style="background: #f59e0b; color: white; width: 100%; margin-bottom: 5px;" onclick="window.cambiarLogistica('${a.id}', 'recogida_en_ruta')">🚚 Buscar</button>`;
          } else if (estadoLogistica === 'recogida_en_ruta') {
            logBadgeColor = 'info'; logBadgeText = 'Regresando';
            actionButtons += `<button class="btn btn-sm" style="background: #10b981; color: white; width: 100%; margin-bottom: 5px;" onclick="window.marcarDevuelta('${a.id}', '${a.id_lavadora}')">🏠 En Almacén</button>`;
          } else {
            logBadgeColor = 'neutral'; logBadgeText = 'Completado';
            actionButtons += `<button class="btn btn-sm" style="background: #ef4444; color: white; width: 100%; margin-bottom: 5px;" onclick="window.eliminarRegistro('${a.id}')"><i class="fa-solid fa-trash"></i> Eliminar</button>`;
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
          <div style="margin-bottom: 4px; font-weight: bold; color: #f8fafc;">$${pagado} / $${costoTotal}</div>
          <span class="badge badge-${pagoBadgeColor}">${pagoBadgeText}</span>
        `;

        if (deuda > 0 && currentTab !== 'completados') {
           actionButtons += `<button class="btn btn-sm" style="background: #10b981; color: white; width: 100%;" onclick="window.abrirModalPago('${a.id}', ${deuda})">💸 Cobrar $${deuda}</button>`;
        }

        return `
        <tr>
          <td class="text-mono">${a.id_lavadora}</td>
          <td>
            <strong>${a.clienteNombre || a.id_cliente}</strong> ${telFormat}
            ${direccionHtml}
            <br><small style="color: #94a3b8;">${a.dias} días</small>
          </td>
          <td>${tiemposHtml}</td>
          <td>
            <span class="badge badge-${logBadgeColor}"><div class="badge-dot"></div>${logBadgeText}</span>
            ${repartidorLabel}
          </td>
          <td>${infoPagoHtml}</td>
          <td style="display: flex; flex-direction: column;">${actionButtons}</td>
        </tr>
      `}).join('');
    } catch (error) {
      console.error("Error cargando alquileres:", error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  // Global functions for buttons
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
      await alquileresService.remove(idAlquiler);
      await loadAlquileres();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // Lógica del Modal de Pago
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

      // 1. Guardar el pago en Finanzas
      await pagosService.add({
        id_alquiler: idAlquiler,
        monto: monto,
        metodo: metodo,
        fecha: Date.now()
      });

      // 2. Actualizar el monto pagado en el Alquiler
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
      
      const costoVal = document.getElementById('alq-costo').value;

      await alquileresService.add({
        id_cliente: clienteId,
        clienteNombre: clienteText,
        clienteDireccion: direccionCli,
        clienteTelefono: telefonoCli,
        id_lavadora: idLavadora,
        dias: document.getElementById('alq-dias').value,
        costo_total: parseFloat(costoVal),
        pagado: 0, 
        repartidor: document.getElementById('alq-repartidor').value,
        hora_entrega: document.getElementById('alq-hora').value,
        estado_alquiler: 'activo',
        estado_logistica: 'entrega_pendiente',
        fecha_inicio: Date.now()
      });

      await lavadorasService.cambiarEstado(idLavadora, 'alquilada');

      form.reset();
      await loadSelects();
      await loadAlquileres();
    } catch (error) {
      alert('Error al guardar');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar';
    }
  });

  loadSelects();
  loadAlquileres();
}
