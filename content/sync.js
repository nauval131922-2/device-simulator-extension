// Content Script injected into all frames for Cross-Device Interaction, Scroll & Click Synchronization

(function() {
  let isReceivingSync = false;

  // 1. LISTEN & SYNC SCROLL EVENTS
  window.addEventListener('scroll', () => {
    if (isReceivingSync) return; // Prevent infinite event loops

    const docElem = document.documentElement;
    const maxScrollY = docElem.scrollHeight - docElem.clientHeight;
    const maxScrollX = docElem.scrollWidth - docElem.clientWidth;

    const scrollRatioY = maxScrollY > 0 ? window.scrollY / maxScrollY : 0;
    const scrollRatioX = maxScrollX > 0 ? window.scrollX / maxScrollX : 0;

    window.parent.postMessage({
      type: 'MOBILE_SIMULATOR_SCROLL',
      scrollRatioY: scrollRatioY,
      scrollRatioX: scrollRatioX,
      scrollY: window.scrollY,
      scrollX: window.scrollX
    }, '*');
  }, { passive: true });

  // 2. LISTEN & SYNC CLICK / LINK NAVIGATION EVENTS
  document.addEventListener('click', (e) => {
    if (isReceivingSync) return;

    // Find closest anchor link element
    const linkEl = e.target.closest('a');
    if (linkEl && linkEl.href) {
      const targetHref = linkEl.href;
      
      // Do not sync javascript:void(0) or internal anchor hash (#) clicks
      if (targetHref.startsWith('http://') || targetHref.startsWith('https://')) {
        window.parent.postMessage({
          type: 'MOBILE_SIMULATOR_NAVIGATE',
          url: targetHref
        }, '*');
      }
    }
  }, true);

  // 3. LISTEN FOR SYNC COMMANDS FROM PARENT SIMULATOR
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    // Handle Scroll Sync
    if (event.data.type === 'MOBILE_SIMULATOR_SYNC_SCROLL') {
      isReceivingSync = true;
      const docElem = document.documentElement;
      const maxScrollY = docElem.scrollHeight - docElem.clientHeight;
      const maxScrollX = docElem.scrollWidth - docElem.clientWidth;

      const targetY = event.data.scrollRatioY * maxScrollY;
      const targetX = event.data.scrollRatioX * maxScrollX;

      window.scrollTo({
        top: targetY,
        left: targetX,
        behavior: 'instant'
      });

      setTimeout(() => {
        isReceivingSync = false;
      }, 100);
    }

    // Handle Navigation / Link Click Sync
    if (event.data.type === 'MOBILE_SIMULATOR_SYNC_NAVIGATE') {
      isReceivingSync = true;
      if (event.data.url && event.data.url !== window.location.href) {
        window.location.href = event.data.url;
      }
    }
  });
})();
