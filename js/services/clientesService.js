import { createService } from './databaseService.js';

const service = createService('clientes');

export const clientesService = {
  ...service,

  async buscar(termino) {
    // Full-text search is done client-side
    const todos = await service.getAll('nombre', 'asc');
    const term = termino.toLowerCase();
    return todos.filter(c =>
      c.nombre?.toLowerCase().includes(term) ||
      c.telefono?.includes(term) ||
      c.cedula?.includes(term)
    );
  },
};
