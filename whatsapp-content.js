// whatsapp-content.js - FIXED VERSION with better injection detection

// Immediately log that file is being executed
console.log('🔵 SattyoAlert script file is executing!');
console.log('🔵 URL:', window.location.href);
console.log('🔵 Chrome runtime available:', typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined');

// Add visible indicator immediately
(function addIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'sattyoalert-load-indicator';
  indicator.innerHTML = '🛡️ SattyoAlert Loading...';
  indicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  
  // Wait for body to exist
  const addToBody = () => {
    if (document.body) {
      document.body.appendChild(indicator);
      console.log('✅ Indicator added to page');
      
      // Remove after 5 seconds
      setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s';
        setTimeout(() => indicator.remove(), 500);
      }, 5000);
    } else {
      setTimeout(addToBody, 100);
    }
  };
  
  addToBody();
})();

// Main WhatsApp Monitor Class
class WhatsAppMonitor {
  constructor() {
    console.log('📱 WhatsAppMonitor constructor called');
    this.messageSelector = 'span.selectable-text.copyable-text';
    this.checkedMessages = new Set();
    this.initialized = false;
    this.init();
  }

  init() {
    console.log('🔄 Initializing WhatsApp monitor...');
    
    // Wait for WhatsApp to load
    this.waitForWhatsAppLoad();
  }

  waitForWhatsAppLoad() {
    console.log('⏰ Waiting for WhatsApp to load...');
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Try multiple selectors
      const conversationPanel = document.querySelector('[data-testid="conversation-panel-body"]');
      const mainPanel = document.querySelector('#main');
      const anyMessages = document.querySelectorAll('span.selectable-text').length > 0;
      
      console.log(`Attempt ${attempts}: Panel=${!!conversationPanel}, Main=${!!mainPanel}, Messages=${anyMessages}`);
      
      if (conversationPanel || mainPanel || anyMessages) {
        console.log('✅ WhatsApp loaded! Starting monitoring...');
        clearInterval(checkInterval);
        this.startMonitoring();
      } else if (attempts >= maxAttempts) {
        console.log('⚠️ WhatsApp load timeout. Will monitor anyway...');
        clearInterval(checkInterval);
        this.startMonitoring();
      }
    }, 1000);
  }

  startMonitoring() {
    if (this.initialized) {
      console.log('⚠️ Already initialized');
      return;
    }
    
    this.initialized = true;
    console.log('🔍 Starting message monitoring...');
    
    // Scan existing messages
    this.scanExistingMessages();
    
    // Setup mutation observer for new messages
    this.setupObserver();
  }

  scanExistingMessages() {
    console.log('📝 Scanning existing messages...');
    
    // Try multiple selectors
    const selectors = [
      'span.selectable-text.copyable-text',
      'span.selectable-text',
      'div[data-testid="msg-container"] span',
    ];
    
    let totalFound = 0;
    
    for (const selector of selectors) {
      const messages = document.querySelectorAll(selector);
      console.log(`  Selector "${selector}": ${messages.length} found`);
      
      messages.forEach(msg => {
        if (this.processMessage(msg)) {
          totalFound++;
        }
      });
      
      if (messages.length > 0) break; // Stop if we found messages
    }
    
    console.log(`✅ Processed ${totalFound} messages`);
  }

  setupObserver() {
    console.log('👁️ Setting up mutation observer...');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Check if this node or its children have messages
            const messages = node.querySelectorAll ? 
              node.querySelectorAll('span.selectable-text') : [];
            
            messages.forEach(msg => this.processMessage(msg));
          }
        });
      });
    });

    // Observe main chat area
    const target = document.querySelector('#main') || 
                   document.querySelector('[data-testid="conversation-panel-body"]') || 
                   document.body;
    
    observer.observe(target, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Observer active on:', target.id || target.className);
  }

  processMessage(messageElement) {
    const text = messageElement.textContent?.trim();
    
    if (!text || text.length < 20) {
      return false;
    }

    // Create unique ID
    const messageId = text.substring(0, 100);
    if (this.checkedMessages.has(messageId)) {
      return false;
    }

    this.checkedMessages.add(messageId);

    // Check if suspicious
    if (this.isSuspicious(text)) {
      console.log('⚠️ Suspicious message detected:', text.substring(0, 50) + '...');
      this.addCheckButton(messageElement, text);
      return true;
    }
    
    return false;
  }

  isSuspicious(text) {
    const keywords = [
      'জরুরি', 'ব্রেকিং', 'শেয়ার করুন', 'ফরওয়ার্ড',
      'breaking', 'urgent', 'forward', 'share immediately',
      'shocking', 'viral', 'must read'
    ];
    
    const lowerText = text.toLowerCase();
    const hasKeyword = keywords.some(kw => lowerText.includes(kw.toLowerCase()));
    
    // Also check for long forwarded messages
    const isLong = text.length > 200 && (text.match(/\n/g) || []).length > 3;
    
    return hasKeyword || isLong;
  }

  addCheckButton(messageElement, text) {
    // Find parent container
    let container = messageElement.closest('div[data-id]') ||
                    messageElement.closest('div.message-in') ||
                    messageElement.closest('div.message-out') ||
                    messageElement.parentElement?.parentElement;
    
    if (!container) {
      console.log('⚠️ No container found for message');
      return;
    }

    // Check if button already exists
    if (container.querySelector('.sattyoalert-check-btn')) {
      return;
    }

    // Create button
    const button = document.createElement('button');
    button.className = 'sattyoalert-check-btn';
    button.innerHTML = '🔍 যাচাই করুন';
    button.style.cssText = `
      display: inline-block;
      margin-top: 8px;
      padding: 6px 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    button.onclick = (e) => {
      e.stopPropagation();
      console.log('🔘 Check button clicked');
      this.checkMessage(text, button);
    };

    container.appendChild(button);
    console.log('✅ Button added to message');
  }

  async checkMessage(text, button) {
    console.log('🔄 Checking message...');
    
    button.innerHTML = '⏳ যাচাই করা হচ্ছে...';
    button.disabled = true;
    button.style.opacity = '0.7';

    try {
      // Check if chrome.runtime is available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        throw new Error('Chrome extension API not available');
      }

      console.log('📡 Sending to background script...');
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'factCheck',
          text: text,
          source: 'whatsapp',
          url: window.location.href
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      console.log('✅ Response received:', response);

      if (response && response.success) {
        this.showResult(response.result, button);
      } else {
        this.showError(button, 'যাচাই ব্যর্থ');
      }

    } catch (error) {
      console.error('❌ Check failed:', error);
      this.showError(button, error.message);
    }
  }

  showResult(result, button) {
    let icon, color, text;

    if (result.verdict === 'false' || result.isFake) {
      icon = '⚠️';
      color = '#ef4444';
      text = 'মিথ্যা সম্ভাবনা';
    } else if (result.verdict === 'true' || result.isVerified) {
      icon = '✓';
      color = '#22c55e';
      text = 'সত্য';
    } else {
      icon = '❓';
      color = '#f59e0b';
      text = 'অনিশ্চিত';
    }

    button.innerHTML = `${icon} ${text}`;
    button.style.backgroundColor = color;
    button.disabled = false;
    button.style.opacity = '1';

    this.showNotification(result);
  }

  showError(button, message) {
    button.innerHTML = '❌ ত্রুটি';
    button.style.backgroundColor = '#6b7280';

    setTimeout(() => {
      button.innerHTML = '🔍 পুনরায় চেষ্টা করুন';
      button.style.backgroundColor = '#3b82f6';
      button.disabled = false;
      button.style.opacity = '1';
    }, 3000);
  }

  showNotification(result) {
    const existing = document.querySelector('.sattyoalert-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'sattyoalert-notification';
    notification.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; width: 350px; max-width: calc(100vw - 40px);
                  background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                  z-index: 999999; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="padding: 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white;
                    display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 16px;">SattyoAlert যাচাইকরণ</strong>
          <button class="sattyoalert-close-btn"
                  style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;
                         width: 28px; height: 28px; border-radius: 50%;">×</button>
        </div>
        <div style="padding: 16px; color: #374151; line-height: 1.6;">
          <p style="margin: 0 0 12px 0;"><strong>ফলাফল:</strong> ${result.verdict || 'অনিশ্চিত'}</p>
          ${result.explanation ? `<p style="margin: 0;">${result.explanation}</p>` : ''}
        </div>
        <div style="padding: 12px 16px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <button class="sattyoalert-details-btn"
                  style="width: 100%; padding: 10px; background: #3b82f6; color: white; border: none;
                         border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Add event listeners (no inline handlers)
    const closeBtn = notification.querySelector('.sattyoalert-close-btn');
    const detailsBtn = notification.querySelector('.sattyoalert-details-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => notification.remove());
    }
    
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        window.open('https://sattyo-alert-hackathon.vercel.app', '_blank');
      });
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 10000);
  }
}

// Initialize when DOM is ready
function initializeMonitor() {
  console.log('🚀 Initializing SattyoAlert WhatsApp Monitor...');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOM loaded, creating monitor...');
      new WhatsAppMonitor();
    });
  } else {
    console.log('📄 DOM already loaded, creating monitor...');
    new WhatsAppMonitor();
  }
}

// Start initialization
initializeMonitor();

// Listen for messages from background
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message from background:', request);
    
    if (request.action === 'initWhatsAppMonitor') {
      new WhatsAppMonitor();
      sendResponse({ success: true });
    }
    
    return true;
  });
}

console.log('✅ SattyoAlert WhatsApp script fully loaded!');