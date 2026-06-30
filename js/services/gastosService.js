import { createService } from './databaseService.js';

const service = createService('gastos');

export const gastosService = {
  ...service,

  async getGastosDelMes(startOfMonth, endOfMonth) {
    const startTs = startOfMonth instanceof Date ? startOfMonth.getTime() : startOfMonth;
    const endTs = endOfMonth instanceof Date ? endOfMonth.getTime() : endOfMonth;
    return service.query([
      { field: 'fecha', op: '>=', value: startTs },
      { field: 'fecha', op: '<=', value: endTs }
    ], 'fecha', 'desc');
  },
  
  async getResumenMensual(startOfMonth, endOfMonth) {
     const gastos = await this.getGastosDelMes(startOfMonth, endOfMonth);
     const resumen = {};
     let totalVES = 0;
     let totalUSD = 0;
     
     gastos.forEach(gasto => {
       const cat = gasto.categoria || 'otros';
       if (!resumen[cat]) resumen[cat] = { totalVES: 0, totalUSD: 0 };
       
       if (gasto.moneda === 'USD') {
           resumen[cat].totalUSD += parseFloat(gasto.monto || 0);
           totalUSD += parseFloat(gasto.monto || 0);
       } else {
           resumen[cat].totalVES += parseFloat(gasto.monto || 0);
           totalVES += parseFloat(gasto.monto || 0);
       }
     });
     
     return { categorias: resumen, totalVES, totalUSD };
  }
};
