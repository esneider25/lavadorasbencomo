import { clientesService } from '../services/clientesService.js';

export async function init(db) {
  const contentDiv = document.getElementById('clientes-content');
  
  contentDiv.innerHTML = `
    <div class="panel">
      <h3>Registrar Nuevo Cliente</h3>
      <form id="form-clientes" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <input type="text" id="cli-nombre" placeholder="Nombre completo" required class="input" style="flex: 1; min-width: 200px;">
        <input type="text" id="cli-telefono" placeholder="Teléfono" required class="input" style="width: 150px;">
        <input type="text" id="cli-direccion" placeholder="Dirección" required class="input" style="flex: 2; min-width: 250px;">
        <button type="submit" class="btn btn-primary">Registrar Cliente</button>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="clientes-tbody">
            <tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('form-clientes');
  const tbody = document.getElementById('clientes-tbody');

  async function loadClientes() {
    try {
      const clientes = await clientesService.getAll();
      if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay clientes registrados</td></tr>';
        return;
      }

      tbody.innerHTML = clientes.map(c => `
        <tr>
          <td class="text-primary">${c.nombre}</td>
          <td>${c.telefono || 'N/A'}</td>
          <td>${c.direccion || 'N/A'}</td>
          <td>
            <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="window.eliminarCliente('${c.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error("Error cargando clientes:", error);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos</td></tr>';
    }
  }

  window.eliminarCliente = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await clientesService.remove(id);
      await loadClientes();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await clientesService.add({
        nombre: document.getElementById('cli-nombre').value,
        telefono: document.getElementById('cli-telefono').value,
        direccion: document.getElementById('cli-direccion').value
      });
      form.reset();
      await loadClientes();
    } catch (error) {
      alert('Error al guardar el cliente');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrar Cliente';
    }
  });

  loadClientes();
}
