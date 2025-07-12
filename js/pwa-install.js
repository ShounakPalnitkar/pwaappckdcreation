let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install-btn');
const pwaInstallPrompt = document.getElementById('pwa-install-prompt');

// Check if app is already installed
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Show install button if PWA isn't installed
function showInstallButton() {
  if (pwaInstallBtn && !isAppInstalled()) {
    pwaInstallBtn.classList.remove('hidden');
  }
}

// Hide install button
function hideInstallButton() {
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.add('hidden');
  }
}

// Show install prompt
function showInstallPrompt() {
  if (pwaInstallPrompt && !isAppInstalled()) {
    pwaInstallPrompt.classList.remove('hidden');
    
    // Hide after 15 seconds if not interacted with
    setTimeout(() => {
      if (pwaInstallPrompt && !pwaInstallPrompt.classList.contains('hidden')) {
        pwaInstallPrompt.classList.add('hidden');
      }
    }, 15000);
  }
}

// Before install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
  
  // Show prompt after 30 seconds if not installed
  setTimeout(() => {
    if (deferredPrompt && !isAppInstalled()) {
      showInstallPrompt();
    }
  }, 30000);
});

// App installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  hideInstallButton();
  if (pwaInstallPrompt) pwaInstallPrompt.classList.add('hidden');
});

// Install button click handler
if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      hideInstallButton();
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
}

// Install prompt button handler
document.getElementById('pwa-install-prompt-btn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }
  deferredPrompt = null;
  if (pwaInstallPrompt) pwaInstallPrompt.classList.add('hidden');
});

// Close prompt handler
document.getElementById('pwa-install-prompt-close')?.addEventListener('click', () => {
  if (pwaInstallPrompt) pwaInstallPrompt.classList.add('hidden');
});

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered:', registration);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available - please refresh');
            }
          });
        });
      } catch (err) {
        console.error('ServiceWorker registration failed:', err);
      }
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  hideInstallButton(); // Hide by default until beforeinstallprompt fires
});
