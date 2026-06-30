import { alquileresService } from '../services/alquileresService.js';
import { clientesService } from '../services/clientesService.js';
import { lavadorasService } from '../services/lavadorasService.js';
import { pagosService } from '../services/pagosService.js';
import { gastosService } from '../services/gastosService.js';

export async function init(db) {
  const contentDiv = document.getElementById('dashboard-content');
  
  contentDiv.innerHTML = `
    <div class="grid-stats">
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
        <div class="stat-card-label">Lavadoras Disponibles</div>
        <div class="stat-card-value" id="dash-lavadoras">-</div>
      </div>
    </div>

    <div class="charts-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px;">
      
      <!-- Chart 1: Ingresos vs Gastos -->
      <div class="panel" style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #cbd5e1; text-align: center;">Ingresos vs Gastos (USD)</h3>
        <canvas id="chart-finanzas" height="200"></canvas>
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
    // 1. Cargar Estadísticas Superiores
    const alquileres = await alquileresService.getActivos();
    document.getElementById('dash-alquileres').textContent = alquileres.length || 0;

    const clientes = await clientesService.getAll();
    document.getElementById('dash-clientes').textContent = clientes.length || 0;

    const lavadoras = await lavadorasService.getAll();
    const disponibles = lavadoras.filter(l => l.estado === 'disponible');
    const alquiladas = lavadoras.filter(l => l.estado === 'alquilada');
    const mantenimiento = lavadoras.filter(l => l.estado === 'mantenimiento');
    document.getElementById('dash-lavadoras').textContent = disponibles.length || 0;

    // 2. Preparar Datos para Gráficos
    // Inventario
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

    // Ingresos vs Gastos
    const pagos = await pagosService.getAll();
    const gastos = await gastosService.getAll();

    let totalIngresos = 0;
    pagos.forEach(p => totalIngresos += parseFloat(p.monto || 0));

    // Convertir todo a una moneda base (aprox). Asumiendo que todo lo registran en USD o asumiendo un mix. 
    // Para simplificar, sumamos los montos. Lo ideal es separar por moneda.
    let totalGastos = 0;
    gastos.forEach(g => {
      // Si quieres precisión, aquí deberías calcular la tasa. Asumiremos suma simple para la demo.
      totalGastos += parseFloat(g.monto || 0); 
    });

    const ctxFinanzas = document.getElementById('chart-finanzas').getContext('2d');
    new Chart(ctxFinanzas, {
      type: 'bar',
      data: {
        labels: ['Ingresos (Pagos)', 'Egresos (Gastos)'],
        datasets: [{
          label: 'Monto Total',
          data: [totalIngresos, totalGastos],
          backgroundColor: ['#10b981', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e1' } },
          x: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
        }
      }
    });

    // Métodos de Pago
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
