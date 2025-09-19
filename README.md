# Travel AI Chatbot

A modern, secure AI-powered travel assistant built with Node.js, Express, and Google's Gemini AI.

## 🚀 Features

- **AI-Powered**: Integrated with Google Gemini for intelligent travel recommendations
- **Modern UI**: Clean, responsive interface with modular architecture
- **Security First**: Rate limiting, input validation, CORS protection, security headers
- **Clean Architecture**: Modular file structure with separation of concerns
- **Production Ready**: Comprehensive logging, error handling, health checks
- **Testing**: Unit tests with Jest and Supertest
- **Travel Focused**: Specialized prompts and responses for travel-related queries
- **Modular Frontend**: Separated HTML, CSS, and JavaScript for better maintainability

## 📁 Project Structure

```
travel-chatbot/
├── controllers/            # Request handlers
├── routes/                # API route definitions
├── services/              # Business logic layer
├── middleware/            # Security middleware
├── config/                # Configuration files
├── tests/                 # Test files
├── public/                # Frontend assets
│   ├── index.html         # Clean HTML structure (100 lines)
│   ├── css/
│   │   └── style.css      # All styles (342 lines)
│   └── js/
│       ├── config.js      # Configuration constants
│       └── app.js         # Main logic (294 lines)
└── server.js              # Application entry point
```

## 🎯 Recent Improvements

### File Structure Optimization
- **Before**: Monolithic `index.html` with 618+ lines
- **After**: Modular structure with separated concerns
  - HTML: 100 lines (clean, semantic)
  - CSS: 342 lines (responsive, organized)
  - JavaScript: 294 lines (class-based architecture)
  - Configuration: Centralized in `config.js`

### Benefits
- ✅ Better maintainability
- ✅ Improved performance
- ✅ Easier debugging
- ✅ Modern development practices
- ✅ Scalable architecture

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd travel-chatbot
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Gemini API key
   ```

3. **Start the application:**
   ```bash
   # Development with auto-restart
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

### Required Environment Variables
- `API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Optional Environment Variables
- `AI_MODEL`: Gemini model to use (default: gemini-1.5-pro)
- `AI_MAX_TOKENS`: Max response tokens (default: 500)
- `CORS_ORIGIN`: Allowed origins (default: *)
- `RATE_LIMIT_MAX_REQUESTS`: Requests per window (default: 100)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Sanitization of user inputs
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin requests
- **Error Handling**: Secure error responses without information leakage

## 📊 Health Monitoring

Check application health:
```bash
# Via npm script
npm run health

# Direct curl
curl http://localhost:3000/api/chat/health
```

## 🚀 Deployment

1. **Set production environment variables**
2. **Install dependencies:** `npm ci --only=production`
3. **Start application:** `npm start`

## 🤝 Contributing

1. Follow the coding guidelines in `AGENTS.md`
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Follow clean architecture principles

## 📄 License

MIT License - see LICENSE file for details