// Travel AI Assistant - Main JavaScript

class TravelChatbot {
  constructor() {
    this.lastMessage = '';
    this.isFirstMessage = true;
    this.messageInput = document.getElementById('messageInput');
    
    // Use configuration from config.js
    this.CONFIG = typeof CONFIG !== 'undefined' ? CONFIG : {
      API: { ENDPOINTS: { CHAT: '/api/chat', HEALTH: '/api/chat/health' } },
      UI: { TYPING_INDICATOR_DELAY: 500, STATUS_CHECK_INTERVAL: 30000 },
      MESSAGES: {
        ERRORS: { GENERIC: 'Maaf, terjadi kesalahan. Silakan coba lagi.' },
        STATUS: { AI_ONLINE: 'AI Online - Siap membantu!', AI_OFFLINE: 'AI Sedang Offline' }
      }
    };
    
    this.initializeEventListeners();
    this.populateQuickSuggestions();
    this.checkAIStatus();
    this.startStatusInterval();
  }

  initializeEventListeners() {
    // Auto-resize textarea
    this.messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });

    // Send message on Enter (but not Shift+Enter)
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Focus on input when page loads
    this.messageInput.focus();
  }

  populateQuickSuggestions() {
    const container = document.getElementById('quickSuggestions');
    if (container && this.CONFIG.QUICK_SUGGESTIONS) {
      container.innerHTML = this.CONFIG.QUICK_SUGGESTIONS.map(suggestion => 
        `<button class="suggestion-btn" onclick="sendQuickMessage('${suggestion.message}')">
          ${suggestion.emoji} ${suggestion.text}
        </button>`
      ).join('');
    }
  }

  // Format AI response for better readability
  formatAIResponse(content) {
    // Convert basic markdown formatting to HTML
    content = content
      // Bold text **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Headings (must be at start of line)
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Convert bullet points and numbered lists
      .replace(/^\*\s+(.*$)/gm, '<li>$1</li>')
      .replace(/^-\s+(.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>')
      
      // Convert paragraphs (double line breaks)
      .split('\n\n')
      .map(paragraph => {
        // Check if paragraph contains list items
        if (paragraph.includes('<li>')) {
          return '<ul>' + paragraph.replace(/\n/g, '') + '</ul>';
        } else {
          // Regular paragraph
          return '<p>' + paragraph.replace(/\n/g, '<br>') + '</p>';
        }
      })
      .join('')
      
      // Clean up extra line breaks and empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/(<br>\s*){2,}/g, '<br>')
      .replace(/<\/ul>\s*<ul>/g, '');
    
    return content;
  }

  addMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove welcome message on first real message
    if (this.isFirstMessage && isUser) {
      chatMessages.innerHTML = '';
      this.isFirstMessage = false;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Format content for better readability (simple markdown-like formatting)
    if (!isUser) {
      content = this.formatAIResponse(content);
    }
    
    messageContent.innerHTML = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.style.display = 'flex';
    typingContent.innerHTML = `
      <span>AI sedang mengetik</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  showError() {
    document.getElementById('errorMessage').style.display = 'block';
  }

  hideError() {
    document.getElementById('errorMessage').style.display = 'none';
  }

  retryLastMessage() {
    if (this.lastMessage) {
      this.messageInput.value = this.lastMessage;
      this.sendMessage();
    }
  }

  sendQuickMessage(message) {
    this.messageInput.value = message;
    this.sendMessage();
  }

  async sendMessage() {
    const input = this.messageInput;
    const sendBtn = document.getElementById('sendBtn');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.lastMessage = message;
    this.hideError();
    
    // Add user message
    this.addMessage(message, true);
    
    // Clear input and disable send button
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      // Hide typing indicator and add AI response
      this.hideTypingIndicator();
      
      if (data.success && data.data && data.data.reply) {
        this.addMessage(data.data.reply);
      } else {
        throw new Error(data.error?.message || 'Tidak ada respons dari server');
      }
      
    } catch (error) {
      console.error('Error:', error);
      this.hideTypingIndicator();
      
      // Add error message to chat
      let errorMsg = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.message.includes('429')) {
        errorMsg = 'Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.';
      } else if (error.message.includes('500')) {
        errorMsg = 'Server mengalami gangguan. Silakan coba lagi nanti.';
      } else if (error.message.includes('Validation failed')) {
        errorMsg = 'Pesan tidak valid. Pastikan pesan tidak kosong dan tidak terlalu panjang.';
      }
      
      this.addMessage(errorMsg);
      this.showError();
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // Check AI service status
  async checkAIStatus() {
    try {
      const response = await fetch('/api/chat/health');
      const data = await response.json();
      const statusElement = document.getElementById('aiStatus');
      
      if (data.services && data.services.ai) {
        if (data.services.ai.status === 'healthy') {
          statusElement.className = 'ai-status online';
          statusElement.innerHTML = '<i class="fas fa-circle"></i><span>AI Online - Siap membantu!</span>';
        } else {
          statusElement.className = 'ai-status offline';
          statusElement.innerHTML = '<i class="fas fa-circle"></i><span>AI Sedang Offline - Mode Bantuan Terbatas</span>';
        }
      }
    } catch (error) {
      const statusElement = document.getElementById('aiStatus');
      statusElement.className = 'ai-status offline';
      statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Status Tidak Diketahui</span>';
    }
  }

  startStatusInterval() {
    // Check AI status every 30 seconds
    setInterval(() => this.checkAIStatus(), 30000);
  }
}

// Global functions for backward compatibility and HTML onclick events
let chatbot;

function sendMessage() {
  if (chatbot) chatbot.sendMessage();
}

function sendQuickMessage(message) {
  if (chatbot) chatbot.sendQuickMessage(message);
}

function retryLastMessage() {
  if (chatbot) chatbot.retryLastMessage();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  chatbot = new TravelChatbot();
});

// Legacy support for window.onload
window.addEventListener('load', () => {
  if (!chatbot) {
    chatbot = new TravelChatbot();
  }
});