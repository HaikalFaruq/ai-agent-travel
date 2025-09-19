import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';
import { AIServiceError } from '../utils/errorHandler.js';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.ai.model });
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      // For Gemini 2.5 models, use simpler initialization test
      const testContent = config.ai.model.includes('2.5') ? 
        { contents: [{ role: "user", parts: [{ text: "Hello" }] }] } :
        { contents: [{ role: "user", parts: [{ text: "test" }] }], generationConfig: { maxOutputTokens: 1 } };
      
      // Test the connection with retry mechanism
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await this.model.generateContent(testContent);
          break;
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            logger.warn(`AI initialization attempt ${attempt} failed, retrying...`, { error: error.message });
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
          }
        }
      }
      
      if (lastError && lastError.message) {
        throw lastError;
      }
      
      this.isInitialized = true;
      logger.info('AI Service initialized successfully', {
        model: config.ai.model
      });
    } catch (error) {
      logger.error('Failed to initialize AI Service', error);
      this.isInitialized = false;
      // Don't throw error to prevent server crash
      logger.warn('AI Service will be unavailable. Server will continue running without AI features.');
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.isInitialized) {
      // Provide helpful fallback responses based on keywords
      const lowerPrompt = prompt.toLowerCase();
      let fallbackResponse = 'Maaf, layanan AI sedang tidak tersedia saat ini. ';
      
      if (lowerPrompt.includes('bali') || lowerPrompt.includes('indonesia')) {
        fallbackResponse += 'Untuk sementara, saya sarankan mengunjungi situs resmi pariwisata Indonesia atau Bali untuk informasi wisata terkini. ';
      } else if (lowerPrompt.includes('hotel') || lowerPrompt.includes('akomodasi')) {
        fallbackResponse += 'Untuk booking hotel, Anda bisa cek di Traveloka, Agoda, atau Booking.com. ';
      } else if (lowerPrompt.includes('tiket') || lowerPrompt.includes('pesawat')) {
        fallbackResponse += 'Untuk tiket pesawat, silakan cek di Traveloka, Tiket.com, atau situs maskapai langsung. ';
      } else if (lowerPrompt.includes('budget') || lowerPrompt.includes('biaya')) {
        fallbackResponse += 'Untuk perencanaan budget, saya sarankan riset di blog travel atau forum seperti TripAdvisor. ';
      }
      
      fallbackResponse += 'Silakan coba lagi nanti atau hubungi agen travel terdekat untuk bantuan lebih lanjut.';
      
      return {
        text: fallbackResponse,
        metadata: { duration: 0, error: 'AI service not available', fallback: true }
      };
    }

    try {
      const startTime = Date.now();
      
      // Enhance prompt for travel context
      const enhancedPrompt = this.enhancePromptForTravel(prompt);
      
      const generationConfig = {
        temperature: options.temperature || config.ai.temperature,
        maxOutputTokens: options.maxTokens || config.ai.maxTokens,
        topK: options.topK || config.ai.topK,
        topP: options.topP || config.ai.topP,
      };

      logger.debug('Generating AI response', {
        promptLength: enhancedPrompt.length,
        config: generationConfig
      });

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        generationConfig,
      });

      const response = result.response.text();
      const duration = Date.now() - startTime;

      logger.info('AI response generated successfully', {
        responseLength: response.length,
        duration: `${duration}ms`,
        tokensUsed: result.response.usageMetadata?.totalTokenCount || 'unknown'
      });

      return {
        text: response,
        metadata: {
          duration,
          tokensUsed: result.response.usageMetadata?.totalTokenCount,
          model: config.ai.model
        }
      };

    } catch (error) {
      logger.error('AI service error', error, {
        promptLength: prompt.length,
        model: config.ai.model
      });

      if (error.message.includes('quota')) {
        throw new AIServiceError('AI service quota exceeded. Please try again later.');
      } else if (error.message.includes('safety')) {
        throw new AIServiceError('Content was blocked by safety filters. Please rephrase your request.');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new AIServiceError('AI service temporarily unavailable. Please try again.');
      } else {
        throw new AIServiceError('Failed to generate response. Please try again.');
      }
    }
  }

  enhancePromptForTravel(originalPrompt) {
    const travelContext = `
Anda adalah asisten perjalanan AI yang ahli dalam memberikan saran wisata yang terstruktur dan mudah dibaca. 

INSTRUKSI FORMAT JAWABAN:
- Gunakan heading dengan emoji untuk setiap kategori (🏖️ Destinasi, 🏨 Akomodasi, 💰 Budget, 🍽️ Kuliner, 🚗 Transportasi, 📋 Tips)
- Gunakan bullet points dan numbering untuk daftar
- Berikan informasi dalam format yang rapi dan terorganisir dengan spacing yang baik
- Gunakan **bold** untuk highlight informasi penting
- Sertakan estimasi harga dalam Rupiah jika relevan
- Gunakan emoji yang relevan untuk setiap poin (🌟 ✈️ 🎯 💡 ⚠️ 📍 🕐)
- Berikan jawaban yang comprehensive namun tidak terlalu panjang

STRUKTUR IDEAL JAWABAN:
1. Sapaan ramah
2. Overview singkat
3. Detail utama dengan subheading ber-emoji
4. Tips praktis dalam section terpisah
5. Penutup yang mengundang pertanyaan lanjutan

FOKUS TOPIK: destinasi, akomodasi, transportasi, budget, itinerary, tips lokal, kuliner, dan aktivitas wisata.

Pertanyaan user: ${originalPrompt}

Berikan jawaban yang ramah, informatif, dan mudah dibaca dengan format yang rapi serta gunakan emoji yang sesuai.
Jika pertanyaan tidak terkait travel, arahkan dengan sopan ke topik wisata.
    `.trim();

    return travelContext;
  }

  async healthCheck() {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        error: 'AI service not initialized',
        model: config.ai.model
      };
    }

    try {
      const startTime = Date.now();
      await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: "health check" }] }],
        generationConfig: { maxOutputTokens: 1 }
      });
      const duration = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: duration,
        model: config.ai.model
      };
    } catch (error) {
      logger.error('AI service health check failed', error);
      return {
        status: 'unhealthy',
        error: error.message,
        model: config.ai.model
      };
    }
  }
}

export const aiService = new AIService();