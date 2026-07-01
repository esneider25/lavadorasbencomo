import { telegramService } from '../services/telegramService.js';
import { configuracionService } from '../services/configuracionService.js';export async function init(db) {
  const contentDiv = document.getElementById('configuracion-content');
  
  contentDiv.innerHTML = `
    <!-- HEADER -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 2rem; margin-bottom: 5px; color: var(--text-primary);">Ajustes del Sistema</h2>
      <p style="color: #94a3b8; font-size: 0.95rem;">Configura las preferencias globales y notificaciones de tu plataforma.</p>
    </div>

    <!-- SETTINGS GRID -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
      
      <!-- TELEGRAM CARD -->
      <div style="background: var(--bg-card); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05);">
        
        <!-- CARD HEADER -->
        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(2, 132, 199, 0.1)); padding: 25px; border-bottom: 1px solid rgba(56, 189, 248, 0.2); display: flex; align-items: center; gap: 15px;">
          <div style="width: 50px; height: 50px; background: #0088cc; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; color: white; box-shadow: 0 4px 10px rgba(0, 136, 204, 0.3);">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: white;">Notificaciones Bot</h3>
            <p style="margin: 3px 0 0; font-size: 0.85rem; color: #94a3b8;">Alertas automáticas a tu celular</p>
          </div>
        </div>

        <!-- CARD BODY -->
        <div style="padding: 25px;">
          <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5;">
            Conecta tu propio <strong>Bot de Telegram</strong> para recibir un mensaje directo cada vez que un alquiler termine, al realizar un cierre de caja, o si hay un recordatorio importante.
          </p>

          <form id="form-telegram" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Telegram Bot Token</label>
              <div style="position: relative;">
                <i class="fa-solid fa-key" style="position: absolute; left: 14px; top: 14px; color: #64748b;"></i>
                <input type="text" id="tg-token" placeholder="Ej: 123456:ABC-DEF1234ghIkl..." class="form-input" style="padding-left: 40px; font-family: monospace; font-size: 0.9rem;">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Telegram Chat ID</label>
              <div style="position: relative;">
                <i class="fa-solid fa-hashtag" style="position: absolute; left: 14px; top: 14px; color: #64748b;"></i>
                <input type="text" id="tg-chatid" placeholder="Ej: 123456789" class="form-input" style="padding-left: 40px; font-family: monospace; font-size: 0.9rem;">
              </div>
              <small style="color: #64748b; font-size: 0.75rem; display: block; margin-top: 6px;"><i class="fa-solid fa-circle-info"></i> ID de tu usuario o grupo destino.</small>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 10px;">
              <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; border-radius: 8px; background: var(--gradient-primary);"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
              <button type="button" id="btn-test-tg" class="btn btn-success" style="flex: 1; padding: 12px; border-radius: 8px; background: var(--gradient-success);"><i class="fa-solid fa-paper-plane"></i> Probar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- FUTURE SETTINGS (PLACEHOLDER DECORATIVO) -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; padding: 25px; display: flex; align-items: center; gap: 20px; transition: 0.3s;">
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; color: #64748b;">
            <i class="fa-solid fa-palette"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: #94a3b8;">Apariencia (Próximamente)</h3>
            <p style="margin: 3px 0 0; font-size: 0.85rem; color: #64748b;">Ajusta los colores y temas de la plataforma.</p>
          </div>
          <i class="fa-solid fa-lock" style="margin-left: auto; color: #475569; font-size: 1.2rem;"></i>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; padding: 25px; display: flex; align-items: center; gap: 20px; transition: 0.3s;">
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; color: #64748b;">
            <i class="fa-solid fa-database"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: #94a3b8;">Respaldo de Datos (Próximamente)</h3>
            <p style="margin: 3px 0 0; font-size: 0.85rem; color: #64748b;">Exporta toda tu información a Excel o PDF.</p>
          </div>
          <i class="fa-solid fa-lock" style="margin-left: auto; color: #475569; font-size: 1.2rem;"></i>
        </div>

      </div>

    </div>
  `;

  const form = document.getElementById('form-telegram');
  const btnTest = document.getElementById('btn-test-tg');
  const tokenInput = document.getElementById('tg-token');
  const chatIdInput = document.getElementById('tg-chatid');

  // Load from Firebase via configuracionService
  const globalConfig = await configuracionService.getGlobal() || {};
  tokenInput.value = globalConfig.tg_bot_token || localStorage.getItem('tg_bot_token') || '';
  chatIdInput.value = globalConfig.tg_chat_id || localStorage.getItem('tg_chat_id') || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Fallback in localStorage just in case (optional, but good for migrating)
    localStorage.setItem('tg_bot_token', tokenInput.value.trim());
    localStorage.setItem('tg_chat_id', chatIdInput.value.trim());
    
    // Save to Firebase
    await configuracionService.saveGlobal({
      tg_bot_token: tokenInput.value.trim(),
      tg_chat_id: chatIdInput.value.trim()
    });
    
    // Nice visual feedback instead of alert
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Guardado!';
    btn.style.background = 'var(--gradient-success)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'var(--gradient-primary)';
    }, 2000);
  });

  btnTest.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const chatId = chatIdInput.value.trim();

    if (!token || !chatId) {
      alert('Por favor, ingresa el Token y el Chat ID primero.');
      return;
    }

    const btn = btnTest;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';

    const success = await telegramService.sendMessage(
      token, 
      chatId, 
      '✅ <b>¡Conexión Exitosa!</b>\\nLas notificaciones de Lavadoras Bencomo están funcionando correctamente.'
    );

    if (success) {
      btn.innerHTML = '<i class="fa-solid fa-check-double"></i> ¡Enviado!';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }, 3000);
    } else {
      alert('Error al enviar. Revisa que el Token y Chat ID sean correctos y que le hayas dado /start al bot.');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}
