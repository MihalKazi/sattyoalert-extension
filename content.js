// content.js
// This runs on all web pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }
  return true;
});

// Add subtle indicator that extension is active
if (document.body) {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #DC2626, #991B1B);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    transition: transform 0.2s;
  `;
  indicator.innerHTML = '✓';
  indicator.title = 'SattyoAlert - ক্লিক করে রিপোর্ট করুন';
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.1)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  document.body.appendChild(indicator);
}