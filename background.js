// background.js - Complete version with fact-check support

// API Configuration
const API_BASE = 'https://sattyo-alert-hackathon.vercel.app/api';
// For local testing: const API_BASE = 'http://localhost:3000/api';

console.log('Background script loaded, API:', API_BASE);

// Create context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  
  // General context menu for all pages
  chrome.contextMenus.create({
    id: 'reportToSattyoAlert',
    title: 'SattyoAlert এ রিপোর্ট করুন',
    contexts: ['selection']
  });

  // WhatsApp-specific context menu
  chrome.contextMenus.create({
    id: 'checkWhatsAppMessage',
    title: 'WhatsApp বার্তা যাচাই করুন',
    contexts: ['selection'],
    documentUrlPatterns: ['https://web.whatsapp.com/*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  
  if (info.menuItemId === 'reportToSattyoAlert' || info.menuItemId === 'checkWhatsAppMessage') {
    const isWhatsApp = tab.url?.includes('web.whatsapp.com');
    
    // Store selected text with source info
    chrome.storage.local.set({ 
      selectedText: info.selectionText,
      source: isWhatsApp ? 'whatsapp' : 'web',
      pageUrl: tab.url
    }, () => {
      console.log('Stored text for popup');
      // Open popup
      chrome.action.openPopup();
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  // Handle ping (for diagnostics)
  if (request.action === 'ping') {
    sendResponse({ 
      status: 'alive', 
      message: 'Background script is running',
      apiBase: API_BASE 
    });
    return true;
  }
  
  // Handle fact-check requests
  if (request.action === 'factCheck') {
    console.log('Fact-check request received');
    handleFactCheck(request, sendResponse);
    return true; // Keep channel open for async response
  }
  
  // Handle WhatsApp message detection
  if (request.action === 'whatsappMessageDetected') {
    handleWhatsAppMessage(request, sendResponse);
    return true;
  }

  // Store data for popup
  if (request.action === 'storeForReport') {
    chrome.storage.local.set({
      selectedText: request.text,
      source: request.source,
      pageUrl: request.url
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Fact-check function
async function handleFactCheck(request, sendResponse) {
  console.log('Processing fact-check for text:', request.text?.substring(0, 50) + '...');
  
  try {
    const apiUrl = `${API_BASE}/fact-check`;
    console.log('Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        source: request.source || 'web',
        url: request.url
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    sendResponse({ 
      success: true, 
      result: data 
    });

  } catch (error) {
    console.error('Fact-check error:', error);
    
    // Return a fallback response instead of failing completely
    sendResponse({ 
      success: true,
      result: {
        verdict: 'uncertain',
        isFake: false,
        isVerified: false,
        confidence: 50,
        explanation: 'API সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
        sources: ['সার্ভার সংযোগ ব্যর্থ'],
        error: error.message
      }
    });
  }
}

// Handle WhatsApp messages
async function handleWhatsAppMessage(request, sendResponse) {
  try {
    // Check if message is suspicious
    const isSuspicious = checkSuspiciousContent(request.text);
    
    if (isSuspicious) {
      console.log('Suspicious WhatsApp message detected');
      
      // Auto-check or store for manual review
      const settings = await chrome.storage.local.get('autoCheck');
      
      if (settings.autoCheck) {
        await handleFactCheck({
          text: request.text,
          source: 'whatsapp',
          url: 'https://web.whatsapp.com'
        }, sendResponse);
      } else {
        sendResponse({ 
          suspicious: true, 
          requiresManualCheck: true 
        });
      }
    } else {
      sendResponse({ suspicious: false });
    }

  } catch (error) {
    console.error('WhatsApp message handling error:', error);
    sendResponse({ error: error.message });
  }
}

// Check if content is suspicious
function checkSuspiciousContent(text) {
  const suspiciousKeywords = [
    // Bengali keywords
    'জরুরি', 'শেয়ার করুন', 'ফরওয়ার্ড', 'ব্রেকিং', 'সত্যি ঘটনা',
    'শকিং', 'বিস্ময়কর', 'আগে মুছে যাবে', 'দ্রুত শেয়ার',
    // English keywords
    'breaking', 'urgent', 'forward this', 'share immediately',
    'shocking', 'must read', 'before deleted', 'viral',
    // Common patterns
    'http://', 'https://', 'bit.ly', 'tinyurl'
  ];

  const lowerText = text.toLowerCase();
  
  // Check for suspicious keywords
  const hasKeywords = suspiciousKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  // Check for forwarded message patterns
  const isLongMessage = text.length > 200;
  const hasMultipleLines = (text.match(/\n/g) || []).length > 3;
  
  return hasKeywords || (isLongMessage && hasMultipleLines);
}

// Listen for tab updates to inject WhatsApp monitor
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('web.whatsapp.com')) {
    console.log('WhatsApp tab loaded, sending init message');
    
    // Give it a moment for content script to load
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'initWhatsAppMonitor' })
        .catch(err => console.log('Tab message failed (this is normal):', err.message));
    }, 1000);
  }
});

console.log('Background script ready!');