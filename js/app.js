// Lógica principal de la aplicación

// Importar configuración de Firebase para asegurar que se inicialice
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  // Manejo del menú lateral en móviles
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // Lógica de Navegación (Tabs)
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  function navigateTo(targetId) {
    // 1. Ocultar todas las vistas
    viewSections.forEach(section => {
      section.style.display = 'none';
    });

    // 2. Quitar clase active de todos los nav-items
    navItems.forEach(item => {
      item.classList.remove('active');
    });

    // 3. Mostrar la vista seleccionada
    const targetView = document.getElementById(`view-${targetId}`);
    if (targetView) {
      targetView.style.display = 'block';
    }

    // 4. Marcar el nav-item como activo
    const activeNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }

    // Cerrar sidebar en móviles tras hacer clic
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }

    // Opcional: Cargar dinámicamente el contenido de la vista si no está cargado
    loadViewData(targetId);
  }

  // Añadir eventos a los enlaces de navegación
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      window.location.hash = `/${targetId}`;
    });
  });

  // Escuchar cambios en la URL (hash)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#/', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      navigateTo(hash);
    } else if (!hash) {
      navigateTo('dashboard');
    }
  });

  // Inicializar cargando la vista desde la URL o el dashboard por defecto
  const initialHash = window.location.hash.replace('#/', '');
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    navigateTo(initialHash);
  } else {
    navigateTo('dashboard');
  }
});

// Función para inicializar datos de cada vista (se expandirá luego)
async function loadViewData(viewName) {
  try {
    // Carga dinámica de los módulos de cada vista
    const module = await import(`./views/${viewName}.js`);
    if (module && module.init) {
      module.init(db);
    }
  } catch (error) {
    console.log(`Vista ${viewName} no implementada o error al cargar:`, error);
  }
}
