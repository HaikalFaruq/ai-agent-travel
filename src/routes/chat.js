import express from "express";
import { sendMessage, healthCheck } from "../controllers/chatController.js";
import { validateChatMessage, sanitizeInput } from "../../middleware/validation.js";

const router = express.Router();

// Health check endpoint
router.get("/health", healthCheck);

// Chat endpoint with validation and sanitization
router.post("/", sanitizeInput, validateChatMessage, sendMessage);

export default router;