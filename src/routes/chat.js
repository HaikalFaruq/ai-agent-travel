import express from "express";
import { sendMessage, healthCheck } from "../controllers/chatController.js";
import { validateChatMessage, sanitizeInput } from "../middleware/validation.js";

const router = express.Router();

// Health check
router.get("/health", healthCheck);

// POST /api/chat
router.post("/", sanitizeInput, validateChatMessage, sendMessage);

export default router;
