document.addEventListener('DOMContentLoaded', () => {
  // Auth Elements
  const authContainer = document.getElementById('auth-container');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const userInfo = document.getElementById('user-info');
  const mainContent = document.getElementById('main-content');
  const userEmail = document.getElementById('user-email');
  
  // Login Elements
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginButton = document.getElementById('login-button');
  const showRegister = document.getElementById('show-register');
  
  // Register Elements
  const registerUsername = document.getElementById('register-username');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');
  const registerButton = document.getElementById('register-button');
  const showLogin = document.getElementById('show-login');
  
  // Logout Button
  const logoutButton = document.getElementById('logout-button');
  
  // Main Content Elements
  const selectedTextEl = document.getElementById('selected-text');
  const saveButton = document.getElementById('save-highlight');
  const highlightsList = document.getElementById('highlights-list');
  const exportButton = document.createElement('button');
  exportButton.id = 'export-highlights';
  exportButton.textContent = 'Export Highlights';
  exportButton.style.marginBottom = '10px';
  exportButton.style.background = '#28a745';
  exportButton.style.color = 'white';
  exportButton.style.border = 'none';
  exportButton.style.padding = '5px 10px';
  exportButton.style.cursor = 'pointer';
  exportButton.style.borderRadius = '3px';
  exportButton.addEventListener('click', exportHighlights);
  document.querySelector('.current-selection').insertBefore(exportButton, saveButton);

  // Reset Password Elements
  const resetPasswordForm = document.getElementById('reset-password-form');
  const resetRequestSection = document.getElementById('reset-request-section');
  const resetConfirmSection = document.getElementById('reset-confirm-section');
  const resetEmail = document.getElementById('reset-email');
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  const requestResetToken = document.getElementById('request-reset-token');
  const resetPasswordButton = document.getElementById('reset-password-button');
  const showResetPassword = document.getElementById('show-reset-password');
  const backToLogin = document.getElementById('back-to-login');
  
  // Check authentication status on load
  checkAuthStatus();
  
  // Auth Functions
  async function checkAuthStatus() {
    const token = await chrome.storage.local.get('auth_token');
    if (token.auth_token) {
      showAuthenticatedUI();
    } else {
      showUnauthenticatedUI();
    }
  }
  
  function showAuthenticatedUI() {
    authContainer.classList.add('hidden');
    userInfo.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    const user = chrome.storage.local.get('user');
    userEmail.textContent = user.email;
  }
  
  function showUnauthenticatedUI() {
    authContainer.classList.remove('hidden');
    userInfo.classList.add('hidden');
    mainContent.classList.add('hidden');
  }
  
  // Login/Register Form Toggle
  showRegister.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });
  
  showLogin.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });
  
  // Reset Password Form Toggle
  showResetPassword.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    resetPasswordForm.classList.remove('hidden');
    resetRequestSection.classList.remove('hidden');
    resetConfirmSection.classList.add('hidden');
  });
  
  backToLogin.addEventListener('click', () => {
    resetPasswordForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    resetRequestSection.classList.remove('hidden');
    resetConfirmSection.classList.add('hidden');
    resetEmail.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  });
  
  // Login Handler
  loginButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.value,
          password: loginPassword.value
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await chrome.storage.local.set({
          auth_token: data.access_token,
          user: data.user
        });
        showAuthenticatedUI();
        loginEmail.value = '';
        loginPassword.value = '';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  });
  
  // Register Handler
  registerButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerUsername.value,
          email: registerEmail.value,
          password: registerPassword.value
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful! Please login.');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerUsername.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  });
  
  // Logout Handler
  logoutButton.addEventListener('click', async () => {
    await chrome.storage.local.remove(['auth_token', 'user']);
    showUnauthenticatedUI();
  });
  
  // Request Reset Token
  requestResetToken.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail.value
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store the reset token temporarily
        await chrome.storage.local.set({ reset_token: data.token });
        // Show the password reset form
        resetRequestSection.classList.add('hidden');
        resetConfirmSection.classList.remove('hidden');
        alert('Reset token sent! Please enter your new password.');
      } else {
        alert(data.error || 'Failed to request reset token');
      }
    } catch (error) {
      alert('Failed to request reset token: ' + error.message);
    }
  });
  
  // Reset Password
  resetPasswordButton.addEventListener('click', async () => {
    if (newPassword.value !== confirmPassword.value) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const { reset_token } = await chrome.storage.local.get('reset_token');
      
      if (!reset_token) {
        alert('Reset token not found. Please request a new reset token.');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: reset_token,
          new_password: newPassword.value
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Clear the reset token
        await chrome.storage.local.remove('reset_token');
        // Show success message and return to login
        alert('Password reset successful! Please login with your new password.');
        resetPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        resetRequestSection.classList.remove('hidden');
        resetConfirmSection.classList.add('hidden');
        resetEmail.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (error) {
      alert('Failed to reset password: ' + error.message);
    }
  });
  
  function getSelection() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.warn('getSelection failed (tab query):', chrome.runtime.lastError.message);
          resolve('');
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('getSelection failed:', chrome.runtime.lastError.message);
            resolve('');
          } else if (!response) {
            console.warn('No response from content script');
            resolve('');
          } else {
            resolve(response.selectedText || '');
          }
        });
      });
    });
  }

  async function updateSelectedText() {
    let selectedText = await getSelection();
    if (!selectedText) {
      setTimeout(async () => {
        selectedText = await getSelection();
        selectedTextEl.textContent = selectedText || 'No text selected.';
        saveButton.disabled = !selectedText;
      }, 200);
    } else {
      selectedTextEl.textContent = selectedText || 'No text selected.';
      saveButton.disabled = !selectedText;
    }
    console.log('Popup received selection:', selectedText);
  }

  saveButton.addEventListener('click', async () => {
    const { auth_token } = await chrome.storage.local.get('auth_token');
    if (!auth_token) {
      alert('Please login to save highlights');
      return;
    }
    
    getSelection().then((text) => {
      if (text) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const pageUrl = tabs[0].url;
          const timestamp = new Date().toISOString();
          
          chrome.storage.local.get(['highlights'], (result) => {
            const highlights = result.highlights || [];
            const isDuplicate = highlights.some(h => h.text === text && h.url === pageUrl);
            
            if (isDuplicate) {
              alert('This highlight is already saved!');
              return;
            }

            highlights.push({ text, url: pageUrl, timestamp });
            chrome.storage.local.set({ highlights }, () => {
              console.log('Highlight saved:', text);
              renderHighlights();
              selectedTextEl.textContent = 'No text selected.';
              saveButton.disabled = true;

              chrome.tabs.sendMessage(tabs[0].id, { action: 'clearSelection' }, () => {
                if (chrome.runtime.lastError) {
                  console.warn('clearSelection failed:', chrome.runtime.lastError.message);
                }
              });
            });
          });
        });
      }
    });
  });

  function renderHighlights() {
    chrome.storage.local.get(['highlights'], (result) => {
      let highlights = result.highlights || [];
      highlightsList.innerHTML = '';
      if (highlights.length === 0) {
        highlightsList.innerHTML = '<p>No highlights saved.</p>';
        return;
      }

      const indexedHighlights = highlights.map((highlight, idx) => ({ ...highlight, originalIndex: idx }));
      indexedHighlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      indexedHighlights.forEach((highlight, sortedIndex) => {
        const div = document.createElement('div');
        div.className = 'highlight';
        const savedDateTime = new Date(highlight.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });

        const barDiv = document.createElement('div');
        barDiv.className = 'highlight-bar';
        barDiv.innerHTML = `
          <div class="highlight-meta">
            <a href="${highlight.url}" target="_blank">${highlight.url}</a>
            <br>
            <span>Saved: ${savedDateTime}</span>
          </div>
          <button class="delete-highlight" data-index="${highlight.originalIndex}">X</button>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'highlight-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'highlight-text';
        textDiv.dataset.fullText = highlight.text;
        textDiv.textContent = highlight.text;

        const tempDiv = document.createElement('div');
        tempDiv.style.display = '-webkit-box';
        tempDiv.style.webkitLineClamp = '2';
        tempDiv.style.webkitBoxOrient = 'vertical';
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.textContent = highlight.text;
        document.body.appendChild(tempDiv);
        const needsToggle = tempDiv.scrollHeight > tempDiv.clientHeight;
        document.body.removeChild(tempDiv);

        if (needsToggle) {
          div.dataset.isTruncated = 'true';
        }

        contentDiv.appendChild(textDiv);
        div.appendChild(barDiv);
        div.appendChild(contentDiv);
        highlightsList.appendChild(div);
      });

      document.querySelectorAll('.highlight').forEach((highlightDiv) => {
        if (highlightDiv.dataset.isTruncated === 'true') {
          highlightDiv.addEventListener('click', (e) => {
            const textDiv = highlightDiv.querySelector('.highlight-text');
            if (!textDiv.classList.contains('full')) {
              textDiv.classList.add('full');
              highlightDiv.style.backgroundColor = '#e6f3ff';
            } else {
              textDiv.classList.remove('full');
              highlightDiv.style.backgroundColor = '#f9f9f9';
            }
            e.stopPropagation();
          });
        }
      });

      document.querySelectorAll('.delete-highlight').forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(button.dataset.index);
          chrome.storage.local.get(['highlights'], (result) => {
            let highlights = result.highlights || [];
            highlights.splice(index, 1);
            chrome.storage.local.set({ highlights }, () => {
              console.log('Highlight deleted at index:', index);
              renderHighlights();
            });
          });
        });
      });
    });
  }

  async function exportHighlights() {
    const { auth_token } = await chrome.storage.local.get('auth_token');
    if (!auth_token) {
      alert('Please login to export highlights');
      return;
    }
    
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      if (highlights.length === 0) {
        alert('No highlights to export!');
        return;
      }

      const dataToSend = highlights.map(h => ({
        url: h.url,
        text: h.text,
        timestamp: h.timestamp
      }));

      console.log('Sending data to backend:', dataToSend);

      fetch('http://localhost:5000/api/highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        },
        body: JSON.stringify(dataToSend)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Highlights exported successfully:', data);
        chrome.storage.local.set({ highlights: [] }, () => {
          renderHighlights();
          alert('Highlights exported to backend!');
        });
      })
      .catch(error => {
        console.error('Error exporting highlights:', error.message);
        alert(`Failed to export highlights: ${error.message}. Check the console for details.`);
      });
    });
  }

  updateSelectedText();
  setInterval(updateSelectedText, 500);
  renderHighlights();
});