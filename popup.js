// popup.js - Fixed version without inline handlers

// Configuration
const USE_LOCAL = false; // Set to true for local testing
const API_BASE_URL = USE_LOCAL 
  ? 'http://localhost:3000' 
  : 'https://sattyo-alert-hackathon.vercel.app';

console.log('Popup loaded, API:', API_BASE_URL);

// Get DOM elements
const form = document.getElementById('reportForm');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const claimInput = document.getElementById('claim');
const sourceUrlInput = document.getElementById('sourceUrl');
const openSiteLink = document.getElementById('openSiteLink');
const resetBtn = document.getElementById('resetBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Set the site link
  if (openSiteLink) {
    openSiteLink.href = API_BASE_URL;
  }
  
  // Load current page URL
  loadCurrentUrl();
  
  // Check if there's text from context menu
  loadStoredText();
  
  // Setup event listeners
  setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
  // Form submission
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
  }
}

// Load current tab URL
async function loadCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && sourceUrlInput) {
      sourceUrlInput.value = tab.url;
    }
  } catch (error) {
    console.error('Error getting tab URL:', error);
  }
}

// Load text from storage (from context menu)
async function loadStoredText() {
  try {
    const result = await chrome.storage.local.get(['selectedText', 'source', 'pageUrl']);
    
    if (result.selectedText && claimInput) {
      claimInput.value = result.selectedText;
      console.log('Loaded stored text, source:', result.source);
    }
    
    if (result.pageUrl && sourceUrlInput) {
      sourceUrlInput.value = result.pageUrl;
    }
    
    // Clear storage after loading
    chrome.storage.local.remove(['selectedText', 'source', 'pageUrl']);
  } catch (error) {
    console.error('Error loading stored text:', error);
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  console.log('Form submitted');
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ জমা দেওয়া হচ্ছে...';
  
  // Get form data
  const formData = new FormData(form);
  const data = {
    claim: formData.get('claim'),
    category: formData.get('category'),
    urgency: formData.get('urgency'),
    sourceUrl: formData.get('sourceUrl') || '',
    source: 'browser-extension'
  };
  
  console.log('Submitting data:', data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Success:', result);
    
    // Show success message
    showSuccess();
    
  } catch (error) {
    console.error('Submission error:', error);
    alert('রিপোর্ট জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।\n\nError: ' + error.message);
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 রিপোর্ট জমা দিন';
  }
}

// Show success message
function showSuccess() {
  if (form && successMessage) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
  }
}

// Reset form
function resetForm() {
  console.log('Resetting form');
  
  if (form && successMessage) {
    // Hide success message
    successMessage.style.display = 'none';
    
    // Show and reset form
    form.style.display = 'block';
    form.reset();
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 রিপোর্ট জমা দিন';
    
    // Reload current URL
    loadCurrentUrl();
  }
}

// Export for potential external use
window.resetForm = resetForm;