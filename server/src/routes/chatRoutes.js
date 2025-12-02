import express from 'express';
import {sendMessage, getChatHistory, addFeedback, createSession} from '../controllers/chatController.js';
import {verifyUser} from "../middleware/authMiddleware.js";
import {permit} from "../middleware/roleMiddleware.js";
import {verifyRagStatus} from '../middleware/serviceStatusMiddleware.js';

const router = express.Router();



// POST /api/chat - invia un messaggio (permesso a tutti)
router.post('/',  verifyUser, permit("user", "operator", "admin"), verifyRagStatus, sendMessage);

// GET /api/chat/session - crea una nuova sessione (permesso a tutti)
router.get('/session', verifyUser, permit("user", "operator", "admin"), createSession);

// POST /api/chat/:messageId/feedback - aggiunge feedback  (permesso a tutti)
router.post('/:messageId/feedback', verifyUser, permit("user", "operator", "admin"), addFeedback);

// GET /api/chat/:sessionId - recupera storico (permesso a operatori e admin)
router.get('/:sessionId', verifyUser, permit("operator", "admin"), getChatHistory);



export default router;