# AGENTS.md - Developer Guidelines

## Build/Run Commands
- **Start server**: `npm start` or `node server.js`
- **Development**: `npm run dev` (with auto-restart)
- **Install dependencies**: `npm install`
- **Run tests**: `npm test`
- **Test with coverage**: `npm run test:coverage`
- **Health check**: `npm run health`

## Code Style Guidelines

### Project Structure (Clean Architecture)
- **Routes**: API endpoints in `/src/routes/`
- **Controllers**: Request handlers in `/src/controllers/`
- **Services**: Business logic in `/services/`
- **Middleware**: Custom middleware in `/middleware/`
- **Utils**: Utilities and helpers in `/utils/`
- **Config**: Environment configuration in `/config/`
- **Tests**: Test files in `/tests/`

### JavaScript/Node.js Conventions
- **ES6 Modules**: Use `import/export` syntax with `"type": "module"`
- **File extensions**: Always include `.js` extension in imports
- **Async/await**: Prefer async/await over promises
- **Error handling**: Use custom error classes and asyncHandler wrapper
- **Validation**: Use express-validator for request validation
- **Security**: All endpoints protected with helmet, CORS, rate limiting

### Error Handling & Logging
- **Custom errors**: Use AppError, ValidationError, AIServiceError classes
- **Logging**: Use structured logging with logger utility
- **Async handlers**: Wrap async functions with asyncHandler
- **Global error handler**: Centralized error handling middleware

### Dependencies & Security
- **Express.js**: Web framework with security middleware
- **Google Generative AI**: AI integration via service layer
- **Validation**: express-validator for input sanitization
- **Security**: helmet, cors, compression, rate-limiting