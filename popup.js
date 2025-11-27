// popup.js

// DUAL ENVIRONMENT SUPPORT
// Change USE_LOCAL to true for local development, false for production
const USE_LOCAL = false; // Toggle this!
const API_BASE_URL = USE_LOCAL 
  ? 'http://localhost:3000' 
  : 'https://sattyo-alert-hackathon.vercel.app';

console.log('Using API:', API_BASE_URL);

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    document.getElementById('sourceUrl').value = tabs[0].url;
  }
});

// Check for selected text
chrome.storage.local.get(['selectedText'], (result) => {
  if (result.selectedText) {
    document.getElementById('claim').value = result.selectedText;
    chrome.storage.local.remove(['selectedText']);
  }
});

// Form submission
document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ জমা হচ্ছে...';
  
  const formData = {
    claim: document.getElementById('claim').value,
    category: document.getElementById('category').value,
    urgency: document.getElementById('urgency').value,
    sourceUrl: document.getElementById('sourceUrl').value,
    timestamp: new Date().toISOString(),
    source: 'browser-extension'
  };
  
  try {
    console.log('Submitting to:', `${API_BASE_URL}/api/reports`);
    
    // Send to API (works for both local and production)
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      console.log('Report submitted successfully');
      showSuccess();
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit');
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = '❌ ব্যর্থ - আবার চেষ্টা করুন';
    setTimeout(() => {
      submitBtn.textContent = '📤 রিপোর্ট জমা দিন';
    }, 2000);
  }
});

function showSuccess() {
  document.getElementById('reportForm').style.display = 'none';
  document.getElementById('successMessage').style.display = 'block';
}

function resetForm() {
  document.getElementById('reportForm').reset();
  document.getElementById('reportForm').style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';
  document.getElementById('submitBtn').disabled = false;
  document.getElementById('submitBtn').textContent = '📤 রিপোর্ট জমা দিন';
}

window.resetForm = resetForm;