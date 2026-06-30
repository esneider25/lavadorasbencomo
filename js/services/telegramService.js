/**
 * Telegram Bot API Integration
 * Sends notifications to a specific user's chat_id using their bot_token
 */

export const telegramService = {
  /**
   * Send a text message via Telegram API
   * @param {string} botToken The Telegram Bot Token
   * @param {string} chatId The user's Chat ID
   * @param {string} message The message to send (supports basic HTML)
   * @returns {Promise<boolean>} Success status
   */
  async sendMessage(botToken, chatId, message) {
    if (!botToken || !chatId) {
      console.warn('Telegram token or chat_id missing');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        console.error('Telegram API error:', data.description);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  },

  /**
   * Helper to format a rental ending alert
   */
  async sendAlertaRecogida(botToken, chatId, lavadoraId, clienteNombre, direccion, minutosRestantes) {
    const emoji = minutosRestantes <= 0 ? '🚨' : '⏳';
    const text = `${emoji} <b>Alerta de Recogida</b>\n\nEl alquiler de la lavadora <b>${lavadoraId}</b> con <b>${clienteNombre}</b> termina en ${minutosRestantes > 0 ? minutosRestantes + ' minutos' : 'este momento'}.\n\n📍 <b>Dirección:</b> ${direccion}`;
    return this.sendMessage(botToken, chatId, text);
  },

  /**
   * Helper to format daily summary
   */
  async sendResumenPagos(botToken, chatId, pendientes) {
    if (!pendientes || pendientes.length === 0) return true;
    
    let text = `⚠️ <b>Pagos Pendientes de Hoy</b>\n\nTienes ${pendientes.length} pagos pendientes:\n\n`;
    pendientes.forEach(p => {
      text += `• ${p.clienteNombre} (${p.moneda} ${p.monto})\n`;
    });
    
    return this.sendMessage(botToken, chatId, text);
  },

  /**
   * Helper to format end of day summary
   */
  async sendCierreCaja(botToken, chatId, resumenData) {
    const { pago_movil, transferencia, efectivo_bs, efectivo_usd } = resumenData;
    
    const text = `💰 <b>Cierre de Caja Diario</b>\n\n` +
      `<b>Pago Móvil:</b> Bs. ${pago_movil.total}\n` +
      `<b>Transferencias:</b> Bs. ${transferencia.total}\n` +
      `<b>Efectivo (Bs):</b> Bs. ${efectivo_bs.total}\n` +
      `<b>Efectivo (USD):</b> $${efectivo_usd.total}\n\n` +
      `Total transacciones: ${pago_movil.count + transferencia.count + efectivo_bs.count + efectivo_usd.count}`;
      
    return this.sendMessage(botToken, chatId, text);
  }
};
