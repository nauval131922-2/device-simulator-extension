// Background Service Worker for Mobile Simulator Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("Mobile Simulator Extension Installed.");

  // Remove X-Frame-Options and Frame-Ancestors headers to allow embedding target pages in iframe simulator
  const RULE_ID = 1;
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "x-frame-options", operation: "remove" },
            { header: "content-security-policy", operation: "remove" }
          ]
        },
        condition: {
          resourceTypes: ["sub_frame"]
        }
      }
    ]
  });
});
