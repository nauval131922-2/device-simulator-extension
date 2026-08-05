document.addEventListener('DOMContentLoaded', () => {
  const openCurrentTabBtn = document.getElementById('openCurrentTabBtn');
  const openBlankBtn = document.getElementById('openBlankBtn');

  openCurrentTabBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let targetUrl = 'https://example.com';
    
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
      targetUrl = tab.url;
    }

    const simulatorUrl = chrome.runtime.getURL(`simulator/simulator.html?url=${encodeURIComponent(targetUrl)}`);
    chrome.tabs.create({ url: simulatorUrl });
    window.close();
  });

  openBlankBtn.addEventListener('click', () => {
    const simulatorUrl = chrome.runtime.getURL('simulator/simulator.html');
    chrome.tabs.create({ url: simulatorUrl });
    window.close();
  });
});
