import { createService } from './databaseService.js';

const service = createService('configuracion');

export const configuracionService = {
  ...service,

  async getGlobal() {
    try {
      const all = await service.getAll();
      if (all.length > 0) {
        return all[0];
      }
      return null;
    } catch (e) {
      console.error('Error fetching global config:', e);
      return null;
    }
  },

  async saveGlobal(data) {
    try {
      const all = await service.getAll();
      if (all.length > 0) {
        return await service.update(all[0].id, data);
      } else {
        return await service.add(data);
      }
    } catch (e) {
      console.error('Error saving global config:', e);
      throw e;
    }
  }
};
