import { createService } from './databaseService.js';

const service = createService('alquileres');

export const alquileresService = {
  ...service,

  async getActivos() {
    return service.query([{ field: 'estado_alquiler', op: '==', value: 'activo' }], 'fecha_inicio', 'desc');
  },

  async getByCliente(idCliente) {
    return service.query([{ field: 'id_cliente', op: '==', value: idCliente }], 'fecha_inicio', 'desc');
  },

  async getByLavadora(idLavadora) {
    return service.query([{ field: 'id_lavadora', op: '==', value: idLavadora }], 'fecha_inicio', 'desc');
  },

  async finalizar(id) {
    return service.update(id, {
      estado_alquiler: 'finalizado',
      fecha_fin_real: Date.now(),
    });
  },

  subscribeActivos(callback) {
    return service.subscribe(callback, [{ field: 'estado_alquiler', op: '==', value: 'activo' }], 'fecha_inicio', 'desc');
  },
};
