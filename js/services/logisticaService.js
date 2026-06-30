import { createService } from './databaseService.js';

const service = createService('despachos');

export const logisticaService = {
  ...service,

  async getDespachosActivos() {
    return service.query([
      { field: 'estado', op: 'in', value: ['pendiente', 'en_ruta'] }
    ], 'fecha_programada', 'asc');
  },
  
  async getDespachosDelDia(startOfDay, endOfDay) {
    const startTs = startOfDay instanceof Date ? startOfDay.getTime() : startOfDay;
    const endTs = endOfDay instanceof Date ? endOfDay.getTime() : endOfDay;
    return service.query([
      { field: 'fecha_programada', op: '>=', value: startTs },
      { field: 'fecha_programada', op: '<=', value: endTs }
    ], 'fecha_programada', 'asc');
  }
};
