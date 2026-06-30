// Lógica principal de la aplicación
import { db, authService } from './firebase-config.js';

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
    console.log(`Vista ${viewName} no implementada o error al cargar:`, error);
  }
}
