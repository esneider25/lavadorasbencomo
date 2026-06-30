import { createService } from './databaseService.js';

const service = createService('mantenimientos');

export const mantenimientoService = {
  ...service,

  async getByLavadora(idLavadora) {
    return service.query([{ field: 'id_lavadora', op: '==', value: idLavadora }], 'fecha', 'desc');
  },
  
  async getPendientes() {
    return service.query([{ field: 'estado', op: '==', value: 'pendiente' }], 'fecha_programada', 'asc');
  }
};
