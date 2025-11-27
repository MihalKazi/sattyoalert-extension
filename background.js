// background.js

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'reportToSattyoAlert',
    title: 'SattyoAlert এ রিপোর্ট করুন',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'reportToSattyoAlert') {
    // Store selected text
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      // Open popup
      chrome.action.openPopup();
    });
  }
});