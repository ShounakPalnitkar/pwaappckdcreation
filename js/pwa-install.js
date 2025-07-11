// pwa-install.js
let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install-btn');

function initializePWA() {
  setupEventListeners();
  registerServiceWorker();
}

function setupEventListeners() {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  
  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', installPWA);
  }
}

function handleBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
  
  setTimeout(() => {
    if (deferredPrompt && !isRunningAsPWA()) {
      showInstallPrompt();
    }
  }, 30000);
}

function handleAppInstalled() {
  deferredPrompt = null;
  hideInstallButton();
}

async function installPWA() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    hideInstallButton();
  }
  deferredPrompt = null;
}

function showInstallButton() {
  if (pwaInstallBtn && !isRunningAsPWA()) {
    pwaInstallBtn.classList.remove('hidden');
  }
}

function hideInstallButton() {
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.add('hidden');
  }
}

function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('SW registered:', registration);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available - please refresh');
            }
          });
        });
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', initializePWA);
