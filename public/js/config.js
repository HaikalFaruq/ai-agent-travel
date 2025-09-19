// Travel AI Assistant - Configuration & Constants

const CONFIG = {
  API: {
    BASE_URL: '/api',
    ENDPOINTS: {
      CHAT: '/api/chat',
      HEALTH: '/api/chat/health'
    }
  },
  
  UI: {
    TYPING_INDICATOR_DELAY: 500,
    STATUS_CHECK_INTERVAL: 30000, // 30 seconds
    AUTO_SCROLL_DELAY: 100,
    MAX_MESSAGE_LENGTH: 1000,
    TEXTAREA_MAX_HEIGHT: 120
  },
  
  MESSAGES: {
    ERRORS: {
      NETWORK: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      RATE_LIMIT: 'Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.',
      SERVER_ERROR: 'Server mengalami gangguan. Silakan coba lagi nanti.',
      VALIDATION: 'Pesan tidak valid. Pastikan pesan tidak kosong dan tidak terlalu panjang.',
      GENERIC: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
    },
    
    STATUS: {
      AI_ONLINE: 'AI Online - Siap membantu!',
      AI_OFFLINE: 'AI Sedang Offline - Mode Bantuan Terbatas',
      CHECKING: 'Mengecek status AI...',
      UNKNOWN: 'Status Tidak Diketahui'
    },
    
    TYPING: 'AI sedang mengetik'
  },
  
  QUICK_SUGGESTIONS: [
    {
      emoji: '🏝️',
      text: 'Destinasi Indonesia',
      message: 'Rekomendasi destinasi wisata di Indonesia'
    },
    {
      emoji: '💰',
      text: 'Budget Travel',
      message: 'Tips budget travel untuk backpacker'
    },
    {
      emoji: '🏨',
      text: 'Hotel Bali',
      message: 'Rekomendasi hotel di Bali'
    },
    {
      emoji: '📅',
      text: 'Itinerary Jogja',
      message: 'Itinerary 3 hari di Yogyakarta'
    }
  ]
};

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}