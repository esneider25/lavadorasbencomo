import { createService } from './databaseService.js';

const service = createService('lavadoras');

export const lavadorasService = {
  ...service,

  async getDisponibles() {
    return service.query([{ field: 'estado', op: '==', value: 'disponible' }]);
  },

  async cambiarEstado(id, nuevoEstado) {
    return service.update(id, { estado: nuevoEstado });
  },
};
