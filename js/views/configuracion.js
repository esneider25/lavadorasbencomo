import { telegramService } from '../services/telegramService.js';

export async function init(db) {
  const contentDiv = document.getElementById('configuracion-content');
  
  contentDiv.innerHTML = `
    <div class="panel" style="max-width: 600px; margin: 0 auto;">
      <h3><i class="fa-brands fa-telegram" style="color: #0088cc;"></i> Configuración de Notificaciones (Telegram)</h3>
      <p class="text-neutral" style="margin-bottom: 20px;">
        Ingresa los datos de tu Bot de Telegram para recibir alertas automáticas cuando un alquiler esté por terminar o al hacer el cierre de caja.
      </p>
      
      <form id="form-telegram" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Bot Token</label>
          <input type="text" id="tg-token" placeholder="Ej: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" class="input" style="width: 100%;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Chat ID</label>
          <input type="text" id="tg-chatid" placeholder="Ej: 123456789" class="input" style="width: 100%;">
          <small style="color: #666;">El ID de tu usuario o del grupo donde el bot enviará los mensajes.</small>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="submit" class="btn btn-primary">Guardar Configuración</button>
          <button type="button" id="btn-test-tg" class="btn" style="background-color: #28a745; color: white;">Probar Conexión</button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('form-telegram');
  const btnTest = document.getElementById('btn-test-tg');
  const tokenInput = document.getElementById('tg-token');
  const chatIdInput = document.getElementById('tg-chatid');

  // Load from localStorage
  tokenInput.value = localStorage.getItem('tg_bot_token') || '';
  chatIdInput.value = localStorage.getItem('tg_chat_id') || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('tg_bot_token', tokenInput.value.trim());
    localStorage.setItem('tg_chat_id', chatIdInput.value.trim());
    alert('Configuración guardada en este navegador.');
  });

  btnTest.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const chatId = chatIdInput.value.trim();

    if (!token || !chatId) {
      alert('Por favor, ingresa el Token y el Chat ID primero.');
      return;
    }

    const btn = btnTest;
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const success = await telegramService.sendMessage(
      token, 
      chatId, 
      '✅ <b>¡Conexión Exitosa!</b>\nLas notificaciones de LavaGestión Pro están funcionando correctamente.'
    );

    if (success) {
      alert('¡Mensaje de prueba enviado! Revisa tu Telegram.');
    } else {
      alert('Error al enviar. Revisa que el Token y Chat ID sean correctos y que le hayas dado /start al bot.');
    }

    btn.disabled = false;
    btn.textContent = 'Probar Conexión';
  });
}
