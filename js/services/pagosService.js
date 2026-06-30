import { createService } from './databaseService.js';

const service = createService('pagos');

export const pagosService = {
  ...service,

  async getByAlquiler(idAlquiler) {
    return service.query([{ field: 'id_alquiler', op: '==', value: idAlquiler }], 'fecha', 'desc');
  },

  async getPagosDelDia(startOfDay, endOfDay) {
    const startTs = startOfDay instanceof Date ? startOfDay.getTime() : startOfDay;
    const endTs = endOfDay instanceof Date ? endOfDay.getTime() : endOfDay;
    return service.query([
      { field: 'fecha', op: '>=', value: startTs },
      { field: 'fecha', op: '<=', value: endTs }
    ], 'fecha', 'desc');
  },
  
  async getResumenPorMetodo(startOfDay, endOfDay) {
     const pagos = await this.getPagosDelDia(startOfDay, endOfDay);
     const resumen = {
       pago_movil: { total: 0, count: 0 },
       transferencia: { total: 0, count: 0 },
       efectivo_bs: { total: 0, count: 0 },
       efectivo_usd: { total: 0, count: 0 },
     };
     
     pagos.forEach(pago => {
       if (resumen[pago.metodo]) {
         resumen[pago.metodo].total += parseFloat(pago.monto || 0);
         resumen[pago.metodo].count++;
       }
     });
     
     return resumen;
  }
};
