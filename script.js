// DOM Elements
const particleCanvas = document.getElementById('particleCanvas');
const fileInput = document.getElementById('fileInput');
const loadFileButton = document.getElementById('loadFileButton');
const webhookInput = document.getElementById('webhookInput');
const addWebhookButton = document.getElementById('addWebhookButton');
const payloadInput = document.getElementById('payloadInput');
const addPayloadButton = document.getElementById('addPayloadButton');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const webhookDropdown = document.getElementById('webhookDropdown');
const removeSelectedButton = document.getElementById('removeSelectedButton');
const deleteWebhookButton = document.getElementById('deleteWebhookButton');
const toastContainer = document.getElementById('toastContainer');
const activeWebhooksCount = document.getElementById('activeWebhooksCount');
const messagesSentCount = document.getElementById('messagesSentCount');
const errorCount = document.getElementById('errorCount');

// Webhooks and Payload Data
let webhooks = [];
let messagesSent = 0;
let errors = 0;
let payload = { content: 'Default message' };

// Particle System Initialization
const particles = [];
const ctx = particleCanvas.getContext('2d');

// Resize canvas to fit screen
function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeCanvas();

// Add particles on mousemove
function addParticle(x, y) {
  particles.push({
    x,
    y,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1,
    size: Math.random() * 5 + 1,
  });
}

// Update particle system
function updateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;
    p.size -= 0.05;
    if (p.size <= 0) particles.splice(particles.indexOf(p), 1);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
}

// Start particle animation
function animateParticles() {
  updateParticles();
  requestAnimationFrame(animateParticles);
}
animateParticles();

particleCanvas.addEventListener('mousemove', (e) =>
  addParticle(e.clientX, e.clientY)
);

// Update Dropdown
function updateDropdown() {
  webhookDropdown.innerHTML = '';
  webhooks.forEach((url) => {
    const option = document.createElement('option');
    option.textContent = url;
    webhookDropdown.appendChild(option);
  });
  activeWebhooksCount.textContent = webhooks.length;
}

// Add Webhooks from File
loadFileButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const urls = reader.result.split('\n').map((url) => url.trim()).filter((url) => url);
      urls.forEach((url) => {
        if (!webhooks.includes(url)) {
          webhooks.push(url);
        }
      });
      updateDropdown();
      showToast('Webhooks loaded successfully!', 'success');
    };
    reader.readAsText(file);
  } else {
    showToast('Please select a file!', 'error');
  }
});

// Add Webhooks Manually
addWebhookButton.addEventListener('click', () => {
  const urls = webhookInput.value.split('\n').map((url) => url.trim()).filter((url) => url);
  urls.forEach((url) => {
    if (!webhooks.includes(url)) {
      webhooks.push(url);
    }
  });
  updateDropdown();
  webhookInput.value = '';
  showToast('Webhooks added successfully!', 'success');
});

// Remove Selected Webhooks
removeSelectedButton.addEventListener('click', () => {
  Array.from(webhookDropdown.selectedOptions).forEach((option) => {
    webhooks.splice(webhooks.indexOf(option.textContent), 1);
  });
  updateDropdown();
  showToast('Selected webhooks removed.', 'info');
});

// Add JSON Payload
addPayloadButton.addEventListener('click', () => {
  try {
    payload = JSON.parse(payloadInput.value);
    showToast('Payload updated successfully!', 'success');
  } catch (error) {
    showToast('Invalid JSON payload!', 'error');
  }
});

// Send Messages to Webhooks
sendButton.addEventListener('click', () => {
  if (!webhooks.length) {
    showToast('No webhooks available to send messages!', 'error');
    return;
  }
  const message = messageInput.value.trim();
  if (!message && !payload.content) {
    showToast('Please enter a message or payload!', 'error');
    return;
  }
  const customPayload = { ...payload };
  if (message) customPayload.content = message;

  webhooks.forEach((url) => {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customPayload),
    })
      .then((response) => {
        if (response.ok) {
          messagesSent++;
          messagesSentCount.textContent = messagesSent;
          showToast('Message sent successfully!', 'success');
        } else {
          errors++;
          errorCount.textContent = errors;
          showToast('Error sending message!', 'error');
        }
      })
      .catch(() => {
        errors++;
        errorCount.textContent = errors;
        showToast('Error sending message!', 'error');
      });
  });
});

// Delete Selected Webhooks
deleteWebhookButton.addEventListener('click', () => {
  const selectedWebhooks = Array.from(webhookDropdown.selectedOptions);
  if (!selectedWebhooks.length) {
    showToast('Please select a webhook to delete!', 'error');
    return;
  }

  selectedWebhooks.forEach((option) => {
    const webhookURL = option.textContent.trim();
    fetch(webhookURL, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          webhooks.splice(webhooks.indexOf(webhookURL), 1);
          updateDropdown();
          showToast('Webhook deleted successfully!', 'success');
        } else {
          showToast('Failed to delete webhook!', 'error');
        }
      })
      .catch(() => {
        showToast('Error deleting webhook!', 'error');
      });
  });
});

// Toast Notifications
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
