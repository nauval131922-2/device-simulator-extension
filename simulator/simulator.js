document.addEventListener('DOMContentLoaded', () => {
  const customResGroup = document.getElementById('customResGroup');
  const customWidthInput = document.getElementById('customWidth');
  const customHeightInput = document.getElementById('customHeight');
  const orientationBtn = document.getElementById('orientationBtn');
  const scaleSelect = document.getElementById('scaleSelect');
  const frameToggleBtn = document.getElementById('frameToggleBtn');
  const syncScrollBtn = document.getElementById('syncScrollBtn');
  const urlInput = document.getElementById('urlInput');
  const goBtn = document.getElementById('goBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');
  
  const viewport = document.getElementById('viewport');
  const devicesGrid = document.getElementById('devicesGrid');

  // Modal elements
  const addDeviceModal = document.getElementById('addDeviceModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalDeviceSelect = document.getElementById('modalDeviceSelect');
  const confirmAddDeviceBtn = document.getElementById('confirmAddDeviceBtn');

  let currentOrientation = 'portrait'; // 'portrait' | 'landscape'
  let isFrameActive = true;
  let isSyncScrollActive = false; // Default Sync = OFF per user request
  let currentTargetUrl = 'https://example.com';
  let draggedDevId = null;

  // Visible devices state
  let visibleDevices = [
    { id: 'dev_1', presetKey: 'iphone15pro', name: 'iPhone 15 Pro', width: 393, height: 852, customUrl: null }
  ];

  // Map of device options HTML for header selector
  const deviceOptionsHTML = modalDeviceSelect.innerHTML;

  // Initial URL check
  const urlParams = new URLSearchParams(window.location.search);
  const initialUrl = urlParams.get('url');
  if (initialUrl) {
    currentTargetUrl = initialUrl;
  }
  urlInput.value = currentTargetUrl;

  // Custom size inputs
  customWidthInput.addEventListener('input', () => {
    if (visibleDevices[0] && visibleDevices[0].presetKey === 'custom') {
      visibleDevices[0].width = parseInt(customWidthInput.value, 10) || 375;
      renderDevices();
    }
  });

  customHeightInput.addEventListener('input', () => {
    if (visibleDevices[0] && visibleDevices[0].presetKey === 'custom') {
      visibleDevices[0].height = parseInt(customHeightInput.value, 10) || 812;
      renderDevices();
    }
  });

  // Add Device Modal triggers
  closeModalBtn.addEventListener('click', () => {
    addDeviceModal.classList.add('hidden');
  });

  confirmAddDeviceBtn.addEventListener('click', () => {
    const sel = modalDeviceSelect.options[modalDeviceSelect.selectedIndex];
    visibleDevices.push({
      id: 'dev_' + Date.now(),
      presetKey: sel.value,
      name: sel.getAttribute('data-name'),
      width: parseInt(sel.getAttribute('data-width'), 10),
      height: parseInt(sel.getAttribute('data-height'), 10),
      customUrl: null
    });
    addDeviceModal.classList.add('hidden');
    renderDevices();
  });

  // Orientation toggle
  orientationBtn.addEventListener('click', () => {
    currentOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
    renderDevices();
  });

  // Zoom / Scale Selector
  scaleSelect.addEventListener('change', () => {
    applyGridScale();
  });

  // Toggle Frame
  frameToggleBtn.addEventListener('click', () => {
    isFrameActive = !isFrameActive;
    if (isFrameActive) {
      frameToggleBtn.textContent = 'Frame: ON';
      frameToggleBtn.classList.add('active');
    } else {
      frameToggleBtn.textContent = 'Frame: OFF';
      frameToggleBtn.classList.remove('active');
    }
    renderDevices();
  });

  // Sync Scroll Toggle (Default OFF)
  syncScrollBtn.addEventListener('click', () => {
    isSyncScrollActive = !isSyncScrollActive;
    if (isSyncScrollActive) {
      syncScrollBtn.textContent = 'Sync: ON';
      syncScrollBtn.classList.add('active');
    } else {
      syncScrollBtn.textContent = 'Sync: OFF';
      syncScrollBtn.classList.remove('active');
    }
  });

  // URL Navigation
  goBtn.addEventListener('click', () => {
    let url = urlInput.value.trim();
    if (url) {
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
        urlInput.value = url;
      }
      currentTargetUrl = url;
      updateAllIframesUrl();
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      goBtn.click();
    }
  });

  // Reload action
  reloadBtn.addEventListener('click', () => {
    updateAllIframesUrl();
  });

  // Screenshot action
  screenshotBtn.addEventListener('click', () => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        alert('Failed to capture screenshot.');
        return;
      }
      const link = document.createElement('a');
      link.download = `device-simulator-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });
  });

  function updateAllIframesUrl() {
    visibleDevices.forEach(d => d.customUrl = null);
    document.querySelectorAll('.device-url-input').forEach(inp => {
      inp.value = currentTargetUrl;
    });
    document.querySelectorAll('.screen-container iframe').forEach(iframe => {
      iframe.src = currentTargetUrl;
    });
  }

  function renderDevices() {
    devicesGrid.innerHTML = '';

    visibleDevices.forEach((dev) => {
      let width = dev.width;
      let height = dev.height;

      if (currentOrientation === 'landscape') {
        width = dev.height;
        height = dev.width;
      }

      const container = document.createElement('div');
      container.className = 'device-container draggable';
      container.setAttribute('data-id', dev.id);

      // Drag & Drop HTML5 Attributes
      container.setAttribute('draggable', 'true');

      container.addEventListener('dragstart', (e) => {
        draggedDevId = dev.id;
        container.classList.add('dragging');
        e.dataTransfer.setData('text/plain', dev.id);
      });

      container.addEventListener('dragend', () => {
        container.classList.remove('dragging');
        draggedDevId = null;
      });

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedDevId && draggedDevId !== dev.id) {
          const dragIndex = visibleDevices.findIndex(d => d.id === draggedDevId);
          const targetIndex = visibleDevices.findIndex(d => d.id === dev.id);
          if (dragIndex > -1 && targetIndex > -1) {
            const item = visibleDevices.splice(dragIndex, 1)[0];
            visibleDevices.splice(targetIndex, 0, item);
            renderDevices();
          }
        }
      });

      // Determine active URL for this specific device
      const devUrl = dev.customUrl || currentTargetUrl;

      // Header label with Device Switcher Dropdown & remove button
      const headerLabel = document.createElement('div');
      headerLabel.className = 'device-header-label';
      headerLabel.innerHTML = `
        <span class="drag-handle-icon" title="Drag to reorder">⋮⋮</span>
        <select class="device-header-select">
          ${deviceOptionsHTML}
        </select>
        ${visibleDevices.length > 1 ? `<button class="btn-remove-device" data-id="${dev.id}" title="Remove Device">&times;</button>` : ''}
      `;

      const headerSelect = headerLabel.querySelector('.device-header-select');
      headerSelect.value = dev.presetKey;

      headerSelect.addEventListener('change', (e) => {
        const selectedOption = headerSelect.options[headerSelect.selectedIndex];
        if (selectedOption.value !== 'custom') {
          dev.presetKey = selectedOption.value;
          dev.name = selectedOption.getAttribute('data-name');
          dev.width = parseInt(selectedOption.getAttribute('data-width'), 10);
          dev.height = parseInt(selectedOption.getAttribute('data-height'), 10);
          renderDevices();
        }
      });

      headerLabel.querySelector('.btn-remove-device')?.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        visibleDevices = visibleDevices.filter(d => d.id !== id);
        renderDevices();
      });

      // Individual URL Input Bar for Device
      const deviceUrlBar = document.createElement('div');
      deviceUrlBar.className = 'device-url-bar';
      deviceUrlBar.innerHTML = `
        <input type="url" class="device-url-input" value="${devUrl}" placeholder="Enter URL..." />
        <button class="btn btn-primary btn-device-go">Go</button>
      `;

      const devUrlInput = deviceUrlBar.querySelector('.device-url-input');
      const devGoBtn = deviceUrlBar.querySelector('.btn-device-go');

      const applyDeviceUrl = () => {
        let u = devUrlInput.value.trim();
        if (u) {
          if (!/^https?:\/\//i.test(u)) {
            u = 'https://' + u;
            devUrlInput.value = u;
          }
          dev.customUrl = u;
          const iframe = wrapper.querySelector('iframe');
          if (iframe) iframe.src = u;
        }
      };

      devGoBtn.addEventListener('click', applyDeviceUrl);
      devUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyDeviceUrl();
      });

      // Wrapper Frame
      const wrapper = document.createElement('div');
      wrapper.className = `device-wrapper ${currentOrientation} ${dev.presetKey} ${isFrameActive ? 'frame-active' : ''}`;
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;

      wrapper.innerHTML = `
        <div class="device-notch">
          <div class="camera-lens"></div>
          <div class="speaker-grille"></div>
        </div>
        <div class="screen-container">
          <iframe src="${devUrl}" allow="geolocation; microphone; camera; midi; encrypted-media"></iframe>
        </div>
        <div class="device-home-bar"></div>
      `;

      container.appendChild(headerLabel);
      container.appendChild(deviceUrlBar);
      container.appendChild(wrapper);
      devicesGrid.appendChild(container);
    });

    // Append + Add Device Card at the FAR RIGHT of devices grid
    const addCard = document.createElement('div');
    addCard.className = 'add-device-card';
    addCard.title = 'Add another device simulator';
    addCard.innerHTML = `
      <div class="add-device-icon">+</div>
      <span>Add Device</span>
    `;

    addCard.addEventListener('click', () => {
      addDeviceModal.classList.remove('hidden');
    });

    devicesGrid.appendChild(addCard);

    attachSyncScrollListeners();

    // Force layout reflow before scaling
    requestAnimationFrame(() => {
      applyGridScale();
      setTimeout(applyGridScale, 50);
    });
  }

  function applyGridScale() {
    const scaleVal = scaleSelect.value;
    if (scaleVal === 'fit') {
      // Temporarily clear transform & transition to accurately get natural bounding rect
      devicesGrid.style.transition = 'none';
      devicesGrid.style.transform = 'none';

      // Use a double requestAnimationFrame to ensure browser layout update
      const vpWidth = Math.max(viewport.clientWidth - 40, 200);
      const vpHeight = Math.max(viewport.clientHeight - 40, 200);

      const gridRect = devicesGrid.getBoundingClientRect();
      const unscaledWidth = gridRect.width || 400;
      const unscaledHeight = gridRect.height || 600;

      if (unscaledWidth > 0 && unscaledHeight > 0) {
        const scaleX = vpWidth / unscaledWidth;
        const scaleY = vpHeight / unscaledHeight;
        const fitScale = Math.min(scaleX, scaleY, 1.0);

        devicesGrid.style.transform = `scale(${fitScale.toFixed(3)})`;
      }
      
      // Restore CSS transition smooth feel
      setTimeout(() => {
        devicesGrid.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      }, 20);
    } else {
      const numericScale = parseFloat(scaleVal);
      devicesGrid.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      devicesGrid.style.transform = `scale(${numericScale})`;
    }
  }

  function attachSyncScrollListeners() {
    // Window level postMessage relay to synchronize all cross-origin frames effortlessly
    if (!window.hasSimulatorScrollRelayBound) {
      window.hasSimulatorScrollRelayBound = true;

      window.addEventListener('message', (event) => {
        if (!isSyncScrollActive || !event.data) return;

        const senderFrame = event.source;
        const iframes = document.querySelectorAll('.screen-container iframe');

        // Relay Scroll Event
        if (event.data.type === 'MOBILE_SIMULATOR_SCROLL') {
          iframes.forEach(iframe => {
            if (iframe.contentWindow && iframe.contentWindow !== senderFrame) {
              iframe.contentWindow.postMessage({
                type: 'MOBILE_SIMULATOR_SYNC_SCROLL',
                scrollRatioY: event.data.scrollRatioY,
                scrollRatioX: event.data.scrollRatioX
              }, '*');
            }
          });
        }

        // Relay Link Navigation Event
        if (event.data.type === 'MOBILE_SIMULATOR_NAVIGATE') {
          if (event.data.url) {
            currentTargetUrl = event.data.url;
            urlInput.value = currentTargetUrl;

            iframes.forEach(iframe => {
              if (iframe.contentWindow && iframe.contentWindow !== senderFrame) {
                iframe.contentWindow.postMessage({
                  type: 'MOBILE_SIMULATOR_SYNC_NAVIGATE',
                  url: currentTargetUrl
                }, '*');
              }
            });
          }
        }
      });
    }
  }

  window.addEventListener('resize', () => {
    if (scaleSelect.value === 'fit') {
      applyGridScale();
    }
  });

  // Initial render
  renderDevices();
});
