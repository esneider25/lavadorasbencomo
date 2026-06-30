import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';
import { pagosService } from '../services/pagosService.js';
import { gastosService } from '../services/gastosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('dashboard-content');
  
  contentDiv.innerHTML = `
    <!-- TARJETAS SUPERIORES -->
    <div class="grid-stats" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      <div class="stat-card blue">
        <div class="stat-card-icon"><i class="fa-solid fa-file-contract"></i></div>
        <div class="stat-card-label">Alquileres Activos</div>
        <div class="stat-card-value" id="dash-alquileres">-</div>
      </div>
      <div class="stat-card green">
        <div class="stat-card-icon"><i class="fa-solid fa-users"></i></div>
        <div class="stat-card-label">Clientes Registrados</div>
        <div class="stat-card-value" id="dash-clientes">-</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-card-icon"><i class="fa-solid fa-jug-detergent"></i></div>
        <div class="stat-card-label">Lavadoras Disp.</div>
        <div class="stat-card-value" id="dash-lavadoras">-</div>
      </div>
      <div class="stat-card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
        <div class="stat-card-icon" style="color: #10b981;"><i class="fa-solid fa-wallet"></i></div>
        <div class="stat-card-label" style="color: #94a3b8;">Ingresos (Histórico)</div>
        <div class="stat-card-value" id="dash-ingresos" style="color: #10b981;">-</div>
      </div>
      <div class="stat-card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
        <div class="stat-card-icon" style="color: #ef4444;"><i class="fa-solid fa-hand-holding-dollar"></i></div>
        <div class="stat-card-label" style="color: #94a3b8;">Deuda en la calle</div>
        <div class="stat-card-value" id="dash-deuda" style="color: #ef4444;">-</div>
      </div>
    </div>

    <!-- PENDIENTES DE HOY -->
    <div class="panel" style="margin-top: 20px; border: 1px solid rgba(245, 158, 11, 0.3);">
      <h3 style="margin-top: 0; color: #f59e0b;"><i class="fa-solid fa-bell"></i> Pendientes de HOY</h3>
      <div id="alertas-container">
        <p style="color: #94a3b8; font-style: italic;">Cargando tareas...</p>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="charts-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px;">
      
      <!-- Chart 1: Tendencia de Ingresos -->
      <div class="panel" style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; grid-column: 1 / -1;">
        <h3 style="margin-top: 0; font-size: 16px; color: #cbd5e1; text-align: center;">Tendencia de los últimos 7 días (USD)</h3>
        <canvas id="chart-tendencia" height="100"></canvas>
      </div>

      <!-- Chart 2: Estado Inventario -->
      <div class="panel" style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #cbd5e1; text-align: center;">Inventario de Lavadoras</h3>
        <canvas id="chart-inventario" height="200"></canvas>
      </div>

      <!-- Chart 3: Métodos de Pago -->
      <div class="panel" style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #cbd5e1; text-align: center;">Uso de Métodos de Pago</h3>
        <canvas id="chart-pagos" height="200"></canvas>
      </div>

    </div>
  `;

  try {
    // 1. Cargar Datos Globales
    const alquileres = await alquileresService.getAll();
    const activos = alquileres.filter(a => a.estado_logistica !== 'devuelta');
    const clientes = await clientesService.getAll();
    const lavadoras = await lavadorasService.getAll();
    const pagos = await pagosService.getAll();
    const gastos = await gastosService.getAll();

    // 2. Llenar Tarjetas Superiores
    const disponibles = lavadoras.filter(l => l.estado === 'disponible');
    const alquiladas = lavadoras.filter(l => l.estado === 'alquilada');
    const mantenimiento = lavadoras.filter(l => l.estado === 'mantenimiento');
    
    document.getElementById('dash-alquileres').textContent = activos.length;
    document.getElementById('dash-clientes').textContent = clientes.length;
    document.getElementById('dash-lavadoras').textContent = disponibles.length;

    let totalIngresos = 0;
    pagos.forEach(p => totalIngresos += parseFloat(p.monto || 0));
    document.getElementById('dash-ingresos').textContent = '$' + totalIngresos.toFixed(2);

    let totalDeuda = 0;
    activos.forEach(a => {
      let deuda = (parseFloat(a.costo_total) || 0) - (parseFloat(a.pagado) || 0);
      if (deuda > 0) totalDeuda += deuda;
    });
    document.getElementById('dash-deuda').textContent = '$' + totalDeuda.toFixed(2);


    // 3. Generar Alertas de HOY
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const hoyMs = hoy.getTime();
    const mananaMs = hoyMs + 86400000;

    let alertasHtml = '';
    
    activos.forEach(a => {
      // Alerta de Entrega
      if (a.estado_logistica === 'entrega_pendiente' || a.estado_logistica === 'entrega_en_ruta') {
        alertasHtml += `
          <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: white;"><i class="fa-solid fa-truck-fast" style="color: #3b82f6;"></i> Entrega Pendiente: ${a.clienteNombre}</strong>
              <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">Lavadora: ${a.id_lavadora} | Hora Entrega: ${a.hora_entrega || 'N/A'} | Dirección: ${a.clienteDireccion || 'N/A'}</div>
            </div>
          </div>
        `;
      }
      
      // Alerta de Vencimiento / Recogida
      let msVencimiento = a.fecha_inicio + ((parseInt(a.dias) || 0) * 86400000);
      if (msVencimiento < mananaMs) {
        // Vence hoy o ya está vencido
        alertasHtml += `
          <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: white;"><i class="fa-solid fa-clock" style="color: #f59e0b;"></i> Vencimiento / Recogida: ${a.clienteNombre}</strong>
              <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">Lavadora: ${a.id_lavadora} | Fecha: ${new Date(msVencimiento).toLocaleDateString()} | Debe: $${((parseFloat(a.costo_total)||0) - (parseFloat(a.pagado)||0)).toFixed(2)}</div>
            </div>
          </div>
        `;
      }
    });

    if (alertasHtml === '') {
      alertasHtml = '<p style="color: #10b981; margin: 0;"><i class="fa-solid fa-check-circle"></i> ¡Todo al día! No hay entregas ni recogidas pendientes para hoy.</p>';
    }
    document.getElementById('alertas-container').innerHTML = alertasHtml;


    // 4. PREPARAR GRÁFICOS
    // --- Tendencia 7 días (Líneas) ---
    const etiquetasDias = [];
    const ingresos7Dias = [0,0,0,0,0,0,0];
    const gastos7Dias = [0,0,0,0,0,0,0];
    
    for (let i = 6; i >= 0; i--) {
      let d = new Date();
      d.setDate(d.getDate() - i);
      etiquetasDias.push(d.toLocaleDateString('es-ES', {weekday: 'short', day:'numeric'}));
    }
    
    pagos.forEach(p => {
      let pDate = new Date(p.fecha || p.creado_en);
      pDate.setHours(0,0,0,0);
      let diffDays = Math.floor((hoyMs - pDate.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays <= 6) {
         ingresos7Dias[6 - diffDays] += parseFloat(p.monto || 0);
      }
    });

    gastos.forEach(g => {
      let gDate = new Date(g.fecha || g.creado_en);
      gDate.setHours(0,0,0,0);
      let diffDays = Math.floor((hoyMs - gDate.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays <= 6) {
         gastos7Dias[6 - diffDays] += parseFloat(g.monto || 0);
      }
    });

    const ctxTendencia = document.getElementById('chart-tendencia').getContext('2d');
    new Chart(ctxTendencia, {
      type: 'line',
      data: {
        labels: etiquetasDias,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresos7Dias,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Gastos',
            data: gastos7Dias,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#cbd5e1' } }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    // --- Inventario (Doughnut) ---
    const ctxInventario = document.getElementById('chart-inventario').getContext('2d');
    new Chart(ctxInventario, {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Alquiladas', 'En Mantenimiento'],
        datasets: [{
          data: [disponibles.length, alquiladas.length, mantenimiento.length],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
        }
      }
    });

    // --- Métodos de Pago (Pie) ---
    const metodos = {
      'pago_movil': 0,
      'transferencia': 0,
      'efectivo_bs': 0,
      'efectivo_usd': 0
    };
    pagos.forEach(p => {
      if(metodos[p.metodo] !== undefined) {
        metodos[p.metodo]++;
      }
    });

    const ctxPagos = document.getElementById('chart-pagos').getContext('2d');
    new Chart(ctxPagos, {
      type: 'pie',
      data: {
        labels: ['Pago Móvil', 'Transferencia', 'Efectivo Bs', 'Efectivo USD'],
        datasets: [{
          data: [metodos['pago_movil'], metodos['transferencia'], metodos['efectivo_bs'], metodos['efectivo_usd']],
          backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#14b8a6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
        }
      }
    });

  } catch (error) {
    console.error("Error cargando dashboard interactivo:", error);
  }
}
