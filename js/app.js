// Lógica principal de la aplicación
import { db, authService } from './firebase-config.js';

// --- Global Custom Modals ---
function createCustomModal(message, title, type = 'alert') {
  return new Promise(resolve =>  {
    const overlay = document.createElement('div');
    overlay.style.cssText = "position: fixed; inset: 0; background: var(--bg-modal-overlay); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; padding: 20px;";
    
    const box = document.createElement('div');
    box.style.cssText = "background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; width: 100%; max-width: 400px; box-shadow: 0 16px 50px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.2s;";
    
    const isConfirm = type === 'confirm';
    const iconColor = isConfirm ? 'var(--status-warning)' : 'var(--accent-blue)';
    const iconClass = isConfirm ? 'fa-triangle-exclamation' : 'fa-circle-info';
    
    box.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 1.25rem; color: var(--text-primary); display: flex; align-items: center;">
        <i class="fa-solid ${iconClass}" style="color: ${iconColor}; margin-right: 10px; font-size: 1.4rem;"></i>
        ${title}
      </h3>
      <p style="margin: 0 0 24px 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        ${isConfirm ? `<button id="custom-modal-cancel" style="padding: 10px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 8px; cursor: pointer; transition: background 0.2s; font-weight: 600;">Cancelar</button>` : ''}
        <button id="custom-modal-ok" style="padding: 10px 16px; background: var(--gradient-primary); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 15px rgba(59,130,246,0.3);">${isConfirm ? 'Confirmar' : 'Aceptar'}</button>
      </div>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    // anim
    setTimeout(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'scale(1)';
    }, 10);
    
    const close = (result) => {
      overlay.style.opacity = '0';
      box.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        resolve(result);
      }, 200);
    };
    
    const btnOk = box.querySelector('#custom-modal-ok');
    btnOk.addEventListener('click', () => close(true));
    btnOk.addEventListener('mouseover', () => btnOk.style.transform = 'scale(1.02)');
    btnOk.addEventListener('mouseout', () => btnOk.style.transform = 'scale(1)');
    
    if (isConfirm) {
      const btnCancel = box.querySelector('#custom-modal-cancel');
      btnCancel.addEventListener('click', () => close(false));
      btnCancel.addEventListener('mouseover', () => btnCancel.style.background = 'rgba(255,255,255,0.1)');
      btnCancel.addEventListener('mouseout', () => btnCancel.style.background = 'rgba(255,255,255,0.05)');
    }
  });
}

window.appAlert = (message, title = 'Aviso') => createCustomModal(message, title, 'alert');
window.appConfirm = (message, title = 'Confirmar Acción') => createCustomModal(message, title, 'confirm');
// ------------------------------


document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const toggleRegister = document.getElementById('toggle-register');
  const toggleLogin = document.getElementById('toggle-login');
  const loginBox = document.getElementById('login-box');
  const registerBox = document.getElementById('register-box');
  const btnLogout = document.getElementById('btn-logout');
  const userNameDisplay = document.getElementById('user-name-display');

  // Toggle between login and register
  if (toggleRegister) {
    toggleRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginBox.style.display = 'none';
      registerBox.style.display = 'block';
    });
  }
  if (toggleLogin) {
    toggleLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerBox.style.display = 'none';
      loginBox.style.display = 'block';
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-pass').value;
      loginError.textContent = '';
      loginError.style.display = 'none';

      try {
        await authService.login(email, pass);
      } catch (err) {
        console.error("Login error:", err);
        loginError.style.display = 'block';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          loginError.textContent = 'Email o contraseña incorrectos.';
        } else if (err.code === 'auth/too-many-requests') {
          loginError.textContent = 'Demasiados intentos. Espera un momento.';
        } else {
          loginError.textContent = 'Error: ' + err.message;
        }
      }
    });
  }

  // Register
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const pass = document.getElementById('register-pass').value;
      const pass2 = document.getElementById('register-pass2').value;
      registerError.textContent = '';
      registerError.style.display = 'none';

      if (pass !== pass2) {
        registerError.style.display = 'block';
        registerError.textContent = 'Las contraseñas no coinciden.';
        return;
      }
      if (pass.length < 6) {
        registerError.style.display = 'block';
        registerError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }

      try {
        await authService.register(email, pass, name);
      } catch (err) {
        console.error("Register error:", err);
        registerError.style.display = 'block';
        if (err.code === 'auth/email-already-in-use') {
          registerError.textContent = 'Este email ya está registrado.';
        } else if (err.code === 'auth/weak-password') {
          registerError.textContent = 'La contraseña es muy débil (mín. 6 caracteres).';
        } else if (err.code === 'auth/operation-not-allowed') {
          registerError.textContent = 'Firebase Auth no está activado. ¡Habilita Email/Contraseña en Firebase!';
        } else {
          registerError.textContent = 'Error: ' + err.message;
        }
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await authService.logout();
      window.location.reload();
    });
  }

  // Auth State Observer — controls what the user sees
  authService.onAuthChanged((user) => {
    if (user) {
      // User is logged in — show app
      loginScreen.style.display = 'none';
      appContainer.style.display = 'flex';

      // Update user display name
      const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
      if (userNameDisplay) userNameDisplay.textContent = initial;

      // Initialize app
      initApp();
    } else {
      // No user — show login
      loginScreen.style.display = 'flex';
      appContainer.style.display = 'none';
    }
  });

  let appInitialized = false;

  function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    // Manejo del menú lateral en móviles
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    function openSidebar() {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', openSidebar);
    }

    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeSidebar);
    }

    // Lógica de Navegación (Tabs)
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    function navigateTo(targetId) {
      viewSections.forEach(section => {
        section.style.display = 'none';
      });

      navItems.forEach(item => {
        item.classList.remove('active');
      });

      const targetView = document.getElementById(`view-${targetId}`);
      if (targetView) {
        targetView.style.display = 'block';
      }

      const activeNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
      if (activeNavItem) {
        activeNavItem.classList.add('active');
      }

      if (window.innerWidth <= 768) {
        closeSidebar();
      }

      loadViewData(targetId);
    }

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('data-target');
        window.location.hash = `/${targetId}`;
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash && document.getElementById(`view-${hash}`)) {
        navigateTo(hash);
      } else if (!hash) {
        navigateTo('dashboard');
      }
    });

    const initialHash = window.location.hash.replace('#/', '');
    if (initialHash && document.getElementById(`view-${initialHash}`)) {
      navigateTo(initialHash);
    } else {
      navigateTo('dashboard');
    }
  }
});

// Función para inicializar datos de cada vista
async function loadViewData(viewName) {
  try {
    const module = await import(`./views/${viewName}.js`);
    if (module && module.init) {
      module.init();
    }
  } catch (error) {
    console.error(`Error al cargar la vista ${viewName}:`, error);
    const contentDiv = document.getElementById(`${viewName}-content`);
    if (contentDiv) {
      contentDiv.innerHTML = `<div style="padding: 20px; color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; text-align: center;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <h3 style="margin-top: 0;">Error al cargar</h3>
        <p style="margin-bottom: 0;">No se pudo cargar la vista de ${viewName}. Verifica tu conexión a internet o recarga la página.</p>
      </div>`;
    }
  }
}
