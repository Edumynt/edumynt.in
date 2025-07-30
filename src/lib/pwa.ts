// PWA service worker registration
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show update available notification
        const updateBanner = document.createElement('div');
        updateBanner.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; background: #2563eb; color: white; padding: 10px; text-align: center; z-index: 9999;">
            <span>New version available!</span>
            <button id="update-btn" style="margin-left: 10px; background: white; color: #2563eb; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Update</button>
            <button id="dismiss-btn" style="margin-left: 5px; background: transparent; color: white; border: 1px solid white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Dismiss</button>
          </div>
        `;
        document.body.appendChild(updateBanner);
        
        document.getElementById('update-btn')?.addEventListener('click', () => {
          updateSW(true);
        });
        
        document.getElementById('dismiss-btn')?.addEventListener('click', () => {
          updateBanner.remove();
        });
      },
      onOfflineReady() {
        console.log('App ready to work offline');
        // Optionally show offline ready notification
      },
    });
  });
}