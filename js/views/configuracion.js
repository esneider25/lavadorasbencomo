export async function init(db) {
  const contentDiv = document.getElementById('configuracion-content');
  
  contentDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="fa-solid fa-cog"></i></div>
      <h3 class="empty-state-title">Configuración</h3>
      <p class="empty-state-text">Ajustes generales del sistema y notificaciones de Telegram.</p>
    </div>
  `;
}
